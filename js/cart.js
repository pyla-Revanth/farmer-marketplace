// Shopping cart, wishlist, checkout, and order tracking

function renderCart() {
  const body = document.getElementById("cartBody");
  const emptyMsg = document.getElementById("cartEmpty");
  const subtotalEl = document.getElementById("cartSubtotal");
  const deliveryEl = document.getElementById("cartDeliveryFee");
  const totalEl = document.getElementById("cartTotal");
  if (!body) return;

  const cart = readStore(STORE.cart, []);
  const products = readStore(STORE.products, []);

  const items = cart
    .map((item) => {
      const p = products.find((pr) => pr.id === item.productId);
      if (!p) return null;
      return {
        ...item,
        product: p,
        lineTotal: p.price * item.quantity
      };
    })
    .filter(Boolean);

  if (items.length === 0) {
    body.innerHTML = "";
    if (emptyMsg) emptyMsg.style.display = "block";
    if (subtotalEl) subtotalEl.textContent = "₹0";
    if (deliveryEl) deliveryEl.textContent = "₹0";
    if (totalEl) totalEl.textContent = "₹0";
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";

  const subtotal = items.reduce((s, r) => s + r.lineTotal, 0);
  const deliveryFee = subtotal >= 300 ? 0 : 30;
  const grandTotal = subtotal + deliveryFee;

  body.innerHTML = items.map((r) => `
    <article class="cart-item-card">
      <div class="cart-item-info">
        <img class="cart-item-img" src="${r.product.image || DEFAULT_PRODUCT_IMG}" onerror="this.src='${DEFAULT_PRODUCT_IMG}'" alt="${r.product.name}" />
        <div>
          <h4 style="font-size:15px;font-weight:700;margin-bottom:2px;">${r.product.name}</h4>
          <div style="font-size:12.5px;color:#64748b;">🧑‍🌾 ${r.product.farmerName} · ₹${r.product.price}/${r.product.unit}</div>
          <div style="font-size:12px;color:var(--primary);font-weight:600;margin-top:2px;">Subtotal: ₹${r.lineTotal}</div>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:14px;">
        <div class="qty-counter">
          <button type="button" data-step="-1" data-id="${r.productId}">−</button>
          <span>${r.quantity} ${r.product.unit}</span>
          <button type="button" data-step="1" data-id="${r.productId}">+</button>
        </div>

        <button type="button" class="btn btn-sm btn-danger-outline" data-remove="${r.productId}" title="Remove item">
          🗑️
        </button>
      </div>
    </article>
  `).join("");

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (deliveryEl) deliveryEl.textContent = deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`;
  if (totalEl) totalEl.textContent = `₹${grandTotal}`;

  body.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      changeQuantity(Number(btn.dataset.id), Number(btn.dataset.step));
    });
  });

  body.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      removeFromCart(Number(btn.dataset.remove));
    });
  });
}

function changeQuantity(productId, step) {
  const cart = readStore(STORE.cart, []);
  const products = readStore(STORE.products, []);
  const item = cart.find((i) => i.productId === productId);
  const prod = products.find((p) => p.id === productId);
  if (!item || !prod) return;

  const newQty = item.quantity + step;
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }
  if (newQty > prod.stock) {
    toast(`Only ${prod.stock} ${prod.unit} available in stock.`, "warning");
    return;
  }

  item.quantity = newQty;
  writeStore(STORE.cart, cart);
  renderCart();
  renderNavCounts();
}

function removeFromCart(productId) {
  const cart = readStore(STORE.cart, []).filter((i) => i.productId !== productId);
  writeStore(STORE.cart, cart);
  renderCart();
  renderNavCounts();
  toast("Removed from your fresh basket.");
}

// Checkout modal & order placement
function openCheckoutModal() {
  const cart = readStore(STORE.cart, []);
  if (cart.length === 0) {
    toast("Your basket is empty. Please add fresh produce first.", "warning");
    return;
  }

  const user = currentUser();
  if (user) {
    const nameEl = document.getElementById("orderCustName");
    const phoneEl = document.getElementById("orderCustPhone");
    if (nameEl && !nameEl.value) nameEl.value = user.name || "";
    if (phoneEl && !phoneEl.value) phoneEl.value = user.phone || "";
  }

  const modal = document.getElementById("checkoutModal");
  if (modal) {
    modal.classList.add("active");
    modal.style.display = "flex";
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
  }
}

function handlePlaceOrder(e) {
  e.preventDefault();
  const name = document.getElementById("orderCustName").value.trim();
  const phone = document.getElementById("orderCustPhone").value.trim();
  const address = document.getElementById("orderCustAddress").value.trim();
  const slot = document.getElementById("orderCustSlot").value;
  const payment = document.getElementById("orderPaymentMethod").value;

  if (!name || !phone || !address) {
    toast("Please fill in your name, phone number, and delivery address.", "error");
    return;
  }

  const cart = readStore(STORE.cart, []);
  const products = readStore(STORE.products, []);

  if (cart.length === 0) {
    toast("Cart is empty.", "warning");
    return;
  }

  let orderTotal = 0;
  const orderItems = [];

  // Group items by farmer or primary farmer
  let primaryFarmerId = 1;
  let primaryFarmerName = "Local Farmer";

  cart.forEach((item) => {
    const p = products.find((pr) => pr.id === item.productId);
    if (p) {
      const lineCost = p.price * item.quantity;
      orderTotal += lineCost;
      primaryFarmerId = p.farmerId || primaryFarmerId;
      primaryFarmerName = p.farmerName || primaryFarmerName;

      orderItems.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        qty: item.quantity,
        unit: p.unit,
        image: p.image || DEFAULT_PRODUCT_IMG
      });

      // Decrement stock
      p.stock = Math.max(0, p.stock - item.quantity);
    }
  });

  const deliveryFee = orderTotal >= 300 ? 0 : 30;
  orderTotal += deliveryFee;

  // Save decremented stock
  writeStore(STORE.products, products);

  // Create Order object
  const newOrder = {
    id: "SF-" + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    farmerId: primaryFarmerId,
    farmerName: primaryFarmerName,
    customerName: name,
    phone: phone,
    address: address,
    slot: slot,
    paymentMethod: payment,
    items: orderItems,
    total: orderTotal,
    status: "Order Placed" // Progression: Order Placed -> Confirmed -> Packed -> Shipped -> Delivered
  };

  const orders = readStore(STORE.orders, []);
  orders.unshift(newOrder);
  writeStore(STORE.orders, orders);

  // Clear cart
  writeStore(STORE.cart, []);
  renderNavCounts();

  closeCheckoutModal();
  renderCart();
  renderOrdersList();

  toast(`🎉 Order #${newOrder.id} placed successfully!`);
  
  // Switch to orders view
  if (typeof switchProductTab === "function") {
    switchProductTab("orders");
  }
}

// Order history and tracking
function renderOrdersList() {
  const container = document.getElementById("ordersContainer");
  if (!container) return;

  const orders = readStore(STORE.orders, []);

  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:50px 20px;background:white;border-radius:var(--radius-lg);border:1px solid var(--card-border);">
        <div style="font-size:36px;margin-bottom:12px;">📦</div>
        <h3 style="font-size:1.3rem;margin-bottom:6px;">No orders placed yet</h3>
        <p style="color:var(--text-muted);font-size:14px;max-width:380px;margin:0 auto 16px;">Browse our fresh farm catalog and have delicious organic harvest delivered straight to your door.</p>
        <button class="btn btn-primary" onclick="switchProductTab('catalog')">Start Shopping 🌿</button>
      </div>
    `;
    return;
  }

  const steps = ["Order Placed", "Confirmed", "Packed", "Shipped", "Delivered"];

  container.innerHTML = orders.map((o) => {
    const currentStepIndex = steps.indexOf(o.status);

    return `
      <div style="background:white;border:1px solid var(--card-border);border-radius:var(--radius-xl);padding:24px;margin-bottom:20px;box-shadow:var(--shadow-sm);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--card-border);padding-bottom:16px;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h3 style="font-size:1.2rem;color:var(--primary-dark);">Order #${o.id}</h3>
              <span class="status-badge placed" style="font-size:11px;">${o.status}</span>
            </div>
            <p style="font-size:12.5px;color:#64748b;margin-top:2px;">Placed on ${o.date} &bull; Grower: <strong>${o.farmerName || 'Verified Farm'}</strong></p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.35rem;font-weight:800;color:var(--primary);">₹${o.total}</div>
            <div style="font-size:12px;color:#64748b;">${o.paymentMethod || 'Cash on Delivery'}</div>
          </div>
        </div>

        <!-- Ordered Items Preview with actual photos -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:12px;margin-bottom:18px;">
          ${(o.items || []).map(i => `
            <div style="display:flex;align-items:center;gap:12px;background:#f8fafc;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--card-border);">
              <img src="${i.image || DEFAULT_PRODUCT_IMG}" style="width:42px;height:42px;border-radius:var(--radius-sm);object-fit:cover;" onerror="this.src='${DEFAULT_PRODUCT_IMG}'" />
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--text-main);">${i.name}</div>
                <div style="font-size:12px;color:#64748b;">${i.qty} ${i.unit || 'kg'} &times; ₹${i.price}</div>
              </div>
            </div>
          `).join("")}
        </div>

        <div style="font-size:13px;color:#475569;margin-bottom:14px;">
          📍 <strong>Delivery Address:</strong> ${o.customerName}, ${o.address} (${o.phone})
        </div>

        <!-- Visual 5-Stage Tracker -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:var(--radius-md);padding:14px 18px;">
          <div style="font-size:12px;font-weight:700;color:var(--primary);text-transform:uppercase;margin-bottom:8px;">Live Dispatch Tracking</div>
          <div class="order-steps-tracker">
            ${steps.map((step, idx) => `
              <span class="order-step-pill ${idx <= currentStepIndex ? 'completed' : ''}">
                ${idx <= currentStepIndex ? '✓' : '○'} ${step}
              </span>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Saved wishlist
function renderWishlistGrid() {
  const container = document.getElementById("wishlistContainer");
  if (!container) return;

  const wishlist = readStore(STORE.wishlist, []);
  const products = readStore(STORE.products, []);

  const items = products.filter(p => wishlist.includes(p.id));

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:50px 20px;background:white;border-radius:var(--radius-lg);border:1px solid var(--card-border);">
        <div style="font-size:36px;margin-bottom:12px;">❤️</div>
        <h3 style="font-size:1.3rem;margin-bottom:6px;">Your Wishlist is Empty</h3>
        <p style="color:var(--text-muted);font-size:14px;max-width:380px;margin:0 auto 16px;">Save your favorite farm produce by tapping the heart icon on any product card.</p>
        <button class="btn btn-primary" onclick="switchProductTab('catalog')">Discover Produce 🌿</button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(p => `
    <div class="product-card">
      <div class="product-img-box">
        <img src="${p.image || DEFAULT_PRODUCT_IMG}" onerror="this.src='${DEFAULT_PRODUCT_IMG}'" alt="${p.name}" />
        <span class="product-badge-fresh">${p.category}</span>
        <button class="product-wishlist-btn active" onclick="toggleWishlist(${p.id}); renderWishlistGrid();" title="Remove from wishlist">
          ❤️
        </button>
      </div>
      <div class="product-body">
        <h3 class="product-title">${p.name}</h3>
        <div class="product-farmer-tag">🧑‍🌾 ${p.farmerName}</div>
        <div class="product-footer-row" style="margin-top:14px;">
          <span class="product-price">₹${p.price}<span class="product-unit">/${p.unit}</span></span>
          <button class="btn btn-sm btn-primary" onclick="addToCart(${p.id}, 1)">+ Add to Cart</button>
        </div>
      </div>
    </div>
  `).join("");
}
