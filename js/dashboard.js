/* ============================================================
   dashboard.js — Farmer Dashboard Logic & Image Upload
   Supports File Upload (Base64), Direct Image URL, & 1-Click Presets
   ============================================================ */

function requireFarmer() {
  const user = currentUser();
  if (!user || user.role !== "farmer") {
    // If not logged in, auto-login as demo farmer Ramesh for smooth project demonstration if desired, or redirect
    const users = readStore(STORE.users, []);
    const demoFarmer = users.find(u => u.role === "farmer");
    if (demoFarmer && !user) {
      setCurrentUser(demoFarmer);
      return demoFarmer;
    } else if (!user) {
      window.location.href = "auth.html";
      return null;
    }
  }
  return user;
}

let activeProductImageData = "";

function initImageUploader() {
  const fileInput = document.getElementById("pImageFile");
  const urlInput = document.getElementById("pImageUrl");
  const previewImg = document.getElementById("pImagePreview");
  const presetsContainer = document.getElementById("presetImagesContainer");

  // Render presets
  if (presetsContainer && typeof PRESET_PRODUCE_IMAGES !== "undefined") {
    presetsContainer.innerHTML = PRESET_PRODUCE_IMAGES.map((p, idx) => `
      <div class="preset-thumb ${idx === 0 ? 'active' : ''}" data-url="${p.url}" title="${p.label}">
        <img src="${p.url}" alt="${p.label}" />
      </div>
    `).join("");

    // Default select first preset if empty
    if (!activeProductImageData) {
      activeProductImageData = PRESET_PRODUCE_IMAGES[0].url;
      if (previewImg) previewImg.src = activeProductImageData;
      if (urlInput) urlInput.value = activeProductImageData;
    }

    presetsContainer.querySelectorAll(".preset-thumb").forEach(thumb => {
      thumb.addEventListener("click", () => {
        presetsContainer.querySelectorAll(".preset-thumb").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        activeProductImageData = thumb.dataset.url;
        if (previewImg) previewImg.src = activeProductImageData;
        if (urlInput) urlInput.value = activeProductImageData;
      });
    });
  }

  // Handle URL change
  if (urlInput) {
    urlInput.addEventListener("input", (e) => {
      const url = e.target.value.trim();
      if (url) {
        activeProductImageData = url;
        if (previewImg) previewImg.src = url;
      }
    });
  }

  // Handle File upload
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(event) {
        activeProductImageData = event.target.result;
        if (previewImg) previewImg.src = activeProductImageData;
        if (urlInput) urlInput.value = ""; // clear URL when file is picked
        if (presetsContainer) {
          presetsContainer.querySelectorAll(".preset-thumb").forEach(t => t.classList.remove("active"));
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

function renderDashboardStats(user) {
  const products = readStore(STORE.products, []).filter((p) => p.farmerId === user.id);
  const orders = readStore(STORE.orders, []).filter((o) => o.farmerId === user.id);
  
  const revenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  
  const lowStock = products.filter((p) => p.stock < 10).length;

  const statProdEl = document.getElementById("statProducts");
  if (statProdEl) statProdEl.textContent = products.length;

  const statOrdEl = document.getElementById("statOrders");
  if (statOrdEl) statOrdEl.textContent = orders.length;

  const statRevEl = document.getElementById("statRevenue");
  if (statRevEl) statRevEl.textContent = `₹${revenue.toLocaleString("en-IN")}`;

  const statLowEl = document.getElementById("statLowStock");
  if (statLowEl) statLowEl.textContent = lowStock;

  renderRecentListings(products);
}

function renderRecentListings(myProducts) {
  const container = document.getElementById("recentListings");
  if (!container) return;

  if (myProducts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:32px;color:#64748b;">
        <p>You haven't listed any farm produce yet.</p>
        <p style="font-size:13px;margin-top:4px;">Use the form above to add your first fresh harvest!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;">
      ${myProducts.slice(0, 4).map(p => `
        <div style="background:white;border:1px solid var(--card-border);border-radius:var(--radius-md);overflow:hidden;box-shadow:var(--shadow-sm);">
          <img src="${p.image || DEFAULT_PRODUCT_IMG}" style="width:100%;height:130px;object-fit:cover;" onerror="this.src='${DEFAULT_PRODUCT_IMG}'" />
          <div style="padding:12px;">
            <div style="font-size:11px;font-weight:700;color:var(--primary);text-transform:uppercase;">${p.category}</div>
            <h4 style="font-size:14px;font-weight:700;margin:2px 0 6px;">${p.name}</h4>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:800;color:var(--primary-dark);">₹${p.price}/${p.unit}</span>
              <span class="product-stock-pill ${p.stock < 10 ? 'low' : ''}">${p.stock} ${p.unit}</span>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function handleAddProduct(e, user) {
  e.preventDefault();
  const name = document.getElementById("pName").value.trim();
  const category = document.getElementById("pCategory").value;
  const price = Number(document.getElementById("pPrice").value);
  const stock = Number(document.getElementById("pStock").value);
  const unit = document.getElementById("pUnit").value.trim() || "kg";
  const description = document.getElementById("pDescription").value.trim();
  const errEl = document.getElementById("addProductError");

  if (!name || !category || !price || !stock) {
    if (errEl) {
      errEl.textContent = "Please fill in product name, category, price and available stock.";
      errEl.classList.remove("hidden");
    }
    return;
  }
  if (errEl) errEl.classList.add("hidden");

  // Determine final image
  let finalImage = activeProductImageData;
  if (!finalImage || finalImage.length < 5) {
    finalImage = DEFAULT_PRODUCT_IMG;
  }

  const products = readStore(STORE.products, []);
  const newProduct = {
    id: Date.now(),
    name,
    category,
    price,
    unit,
    stock,
    farmerId: user.id,
    farmerName: user.name,
    farmLocation: user.farm || "Local Farm",
    image: finalImage,
    description: description || `Fresh farm-grown ${name}. Harvested and handled with extreme care directly by ${user.name}.`,
    harvestDate: "Fresh Harvest",
    reviews: []
  };

  products.unshift(newProduct);
  writeStore(STORE.products, products);

  toast(`🌿 "${name}" added to marketplace successfully!`);
  document.getElementById("addProductForm").reset();
  
  // Reset preview to first preset
  if (typeof PRESET_PRODUCE_IMAGES !== "undefined" && PRESET_PRODUCE_IMAGES[0]) {
    activeProductImageData = PRESET_PRODUCE_IMAGES[0].url;
    const previewImg = document.getElementById("pImagePreview");
    if (previewImg) previewImg.src = activeProductImageData;
  }

  renderDashboardStats(user);
}
