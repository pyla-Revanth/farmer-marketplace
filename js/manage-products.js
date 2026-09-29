/* ============================================================
   manage-products.js — Edit/Delete Products & Manage Orders
   Includes Edit Modal with working Cancel, Image Editing & Order Progression
   ============================================================ */

let editingId = null;
let editModalImageData = "";

function renderMyProducts(user) {
  const tbody = document.getElementById("myProductsBody");
  if (!tbody) return;

  const products = readStore(STORE.products, []).filter((p) => p.farmerId === user.id);

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:36px;color:#64748b;">
          <p style="font-size:15px;font-weight:600;">You haven't listed any farm produce yet.</p>
          <a href="farmer-dashboard.html#addProduct" class="btn btn-sm btn-primary" style="margin-top:12px;">+ Add Your First Harvest</a>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map((p) => `
    <tr>
      <td>
        <div class="table-prod-cell">
          <img class="table-prod-img" src="${p.image || DEFAULT_PRODUCT_IMG}" onerror="this.src='${DEFAULT_PRODUCT_IMG}'" alt="${p.name}" />
          <div>
            <div style="font-weight:700;color:var(--text-main);">${p.name}</div>
            <div style="font-size:12px;color:var(--primary);font-weight:600;">${p.category}</div>
          </div>
        </div>
      </td>
      <td>
        <strong style="color:var(--primary-dark);font-size:15px;">₹${p.price}</strong>
        <span style="font-size:12px;color:#64748b;">/${p.unit}</span>
      </td>
      <td>
        <span class="product-stock-pill ${p.stock < 10 ? 'low' : ''}">
          ${p.stock} ${p.unit} in stock
        </span>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:4px;font-size:13px;color:#f59e0b;">
          ★ ${getAverageRating(p).avg}
          <span style="font-size:11px;color:#94a3b8;">(${getAverageRating(p).count})</span>
        </div>
      </td>
      <td>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-sm btn-outline-primary" data-edit="${p.id}">Edit</button>
          <button class="btn btn-sm btn-danger-outline" data-delete="${p.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");

  // Attach Edit listeners
  tbody.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openEditModal(Number(btn.dataset.edit));
    })
  );

  // Attach Delete listeners
  tbody.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      deleteProduct(Number(btn.dataset.delete), user);
    })
  );
}

function initEditPresets() {
  const container = document.getElementById("editPresetImagesContainer");
  if (!container || typeof PRESET_PRODUCE_IMAGES === "undefined") return;

  container.innerHTML = PRESET_PRODUCE_IMAGES.map((p) => `
    <div class="preset-thumb" data-url="${p.url}" title="${p.label}">
      <img src="${p.url}" alt="${p.label}" />
    </div>
  `).join("");

  container.querySelectorAll(".preset-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      container.querySelectorAll(".preset-thumb").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      editModalImageData = thumb.dataset.url;
      const preview = document.getElementById("editImagePreview");
      if (preview) preview.src = editModalImageData;
      const urlInput = document.getElementById("editImageUrl");
      if (urlInput) urlInput.value = editModalImageData;
    });
  });

  const fileInput = document.getElementById("editImageFile");
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        editModalImageData = event.target.result;
        const preview = document.getElementById("editImagePreview");
        if (preview) preview.src = editModalImageData;
        const urlInput = document.getElementById("editImageUrl");
        if (urlInput) urlInput.value = "";
      };
      reader.readAsDataURL(file);
    });
  }

  const urlInput = document.getElementById("editImageUrl");
  if (urlInput) {
    urlInput.addEventListener("input", (e) => {
      const url = e.target.value.trim();
      if (url) {
        editModalImageData = url;
        const preview = document.getElementById("editImagePreview");
        if (preview) preview.src = url;
      }
    });
  }
}

function openEditModal(id) {
  const products = readStore(STORE.products, []);
  const p = products.find((pr) => pr.id === id);
  if (!p) return;

  editingId = id;
  editModalImageData = p.image || DEFAULT_PRODUCT_IMG;

  document.getElementById("editName").value = p.name;
  document.getElementById("editCategory").value = p.category || "Vegetables";
  document.getElementById("editPrice").value = p.price;
  document.getElementById("editStock").value = p.stock;
  document.getElementById("editUnit").value = p.unit || "kg";
  document.getElementById("editDescription").value = p.description || "";
  
  const preview = document.getElementById("editImagePreview");
  if (preview) preview.src = editModalImageData;

  const urlInput = document.getElementById("editImageUrl");
  if (urlInput) urlInput.value = p.image && p.image.startsWith("http") ? p.image : "";

  const modal = document.getElementById("editModal");
  if (modal) {
    modal.classList.add("active");
    modal.style.display = "flex"; // Explicitly ensure display
  }
}

function closeEditModal() {
  editingId = null;
  editModalImageData = "";
  const modal = document.getElementById("editModal");
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none"; // Explicitly ensure hiding
  }
}

function saveEditedProduct(e, user) {
  e.preventDefault();
  if (!editingId) return;

  const products = readStore(STORE.products, []);
  const p = products.find((pr) => pr.id === editingId);
  if (!p) return;

  p.name = document.getElementById("editName").value.trim() || p.name;
  p.category = document.getElementById("editCategory").value || p.category;
  p.price = Number(document.getElementById("editPrice").value) || p.price;
  p.stock = Number(document.getElementById("editStock").value) || p.stock;
  p.unit = document.getElementById("editUnit").value.trim() || p.unit;
  p.description = document.getElementById("editDescription").value.trim() || p.description;
  
  if (editModalImageData && editModalImageData.length > 5) {
    p.image = editModalImageData;
  }

  writeStore(STORE.products, products);
  closeEditModal();
  renderMyProducts(user);
  toast(`✓ Updated "${p.name}" successfully!`);
}

function deleteProduct(id, user) {
  const products = readStore(STORE.products, []);
  const p = products.find(pr => pr.id === id);
  const name = p ? p.name : "Product";

  if (!confirm(`Are you sure you want to remove "${name}" from your marketplace listings?`)) {
    return;
  }

  const updated = products.filter((item) => item.id !== id);
  writeStore(STORE.products, updated);
  renderMyProducts(user);
  toast(`"${name}" removed from marketplace.`);
}

/* ============================================================
   ORDER MANAGEMENT FOR FARMER
   ============================================================ */
function renderMyOrders(user) {
  const tbody = document.getElementById("ordersBody");
  if (!tbody) return;

  const orders = readStore(STORE.orders, []).filter((o) => o.farmerId === user.id);

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:36px;color:#64748b;">
          No customer orders received yet.
        </td>
      </tr>
    `;
    return;
  }

  const steps = ["Order Placed", "Confirmed", "Packed", "Shipped", "Delivered"];
  const nextStage = {
    "Order Placed": "Confirmed",
    "Pending": "Confirmed",
    "Confirmed": "Packed",
    "Accepted": "Packed",
    "Packed": "Shipped",
    "Shipped": "Delivered",
    "Delivered": null,
  };

  tbody.innerHTML = orders.map((o) => {
    const currentStepIndex = steps.indexOf(o.status);
    const next = nextStage[o.status];

    const itemsSummary = (o.items || []).map(i => `${i.name} (${i.qty} ${i.unit || 'kg'})`).join(", ") 
      || `${o.productName || 'Harvest Item'} (${o.qty || 1} ${o.unit || 'kg'})`;

    let badgeClass = "placed";
    if (o.status === "Confirmed" || o.status === "Accepted") badgeClass = "confirmed";
    if (o.status === "Packed") badgeClass = "packed";
    if (o.status === "Shipped") badgeClass = "shipped";
    if (o.status === "Delivered") badgeClass = "delivered";

    return `
      <tr>
        <td>
          <div style="font-weight:700;color:var(--text-main);">${o.id}</div>
          <div style="font-size:12px;color:#64748b;">${o.date || 'Recent'}</div>
        </td>
        <td>
          <div style="font-weight:600;">${o.customerName}</div>
          <div style="font-size:12px;color:#64748b;">${o.phone || 'Phone on file'}</div>
          <div style="font-size:11px;color:#94a3b8;max-width:200px;line-height:1.3;">${o.address || ''}</div>
        </td>
        <td>
          <div style="font-size:13.5px;max-width:220px;">${itemsSummary}</div>
        </td>
        <td>
          <strong style="color:var(--primary-dark);font-size:15px;">₹${o.total || (o.qty * 40)}</strong>
        </td>
        <td>
          <span class="status-badge ${badgeClass}">${o.status}</span>
          <div class="order-steps-tracker" style="margin-top:6px;">
            ${steps.map((st, idx) => `
              <span class="order-step-pill ${idx <= currentStepIndex ? 'completed' : ''}" title="${st}">
                ${idx <= currentStepIndex ? '✓' : '○'} ${st}
              </span>
            `).join("")}
          </div>
        </td>
        <td>
          ${next ? `
            <button class="btn btn-sm btn-primary" data-advance="${o.id}">
              Mark ${next}
            </button>
          ` : `
            <span style="font-size:12.5px;color:var(--primary);font-weight:700;">✓ Completed</span>
          `}
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("[data-advance]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      advanceOrderStatus(btn.dataset.advance, user);
    })
  );
}

function advanceOrderStatus(orderId, user) {
  const orders = readStore(STORE.orders, []);
  const o = orders.find((ord) => String(ord.id) === String(orderId));
  if (!o) return;

  const nextStage = {
    "Order Placed": "Confirmed",
    "Pending": "Confirmed",
    "Confirmed": "Packed",
    "Accepted": "Packed",
    "Packed": "Shipped",
    "Shipped": "Delivered",
  };

  const next = nextStage[o.status];
  if (next) {
    o.status = next;
    writeStore(STORE.orders, orders);
    renderMyOrders(user);
    toast(`Order #${o.id} marked as "${next}"!`);
  }
}
