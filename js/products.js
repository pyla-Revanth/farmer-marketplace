/* ============================================================
   products.js — Marketplace Catalog, Search, Categories,
   Wishlist, Sorting & Product Detail Modal with Reviews
   ============================================================ */

let activeCategory = "All";
let searchTerm = "";
let sortBy = "default";
let selectedModalProductId = null;
let selectedModalRating = 5;

function initSearchAndFilters() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      renderGrid();
    });
  }

  const sortSelect = document.getElementById("sortFilter");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortBy = e.target.value;
      renderGrid();
    });
  }
}

function renderCategoryCards(containerId = "categoriesContainer") {
  const holder = document.getElementById(containerId);
  if (!holder || typeof CATEGORIES_DATA === "undefined") return;

  const products = readStore(STORE.products, []);

  holder.innerHTML = CATEGORIES_DATA.map((cat) => {
    const count = products.filter(p => p.category === cat.name).length;
    const isActive = activeCategory === cat.name;
    return `
      <div class="category-card ${isActive ? 'active' : ''}" data-cat="${cat.name}">
        <div class="category-img-wrap">
          <img src="${cat.image}" alt="${cat.name}" onerror="this.src='${DEFAULT_PRODUCT_IMG}'" />
        </div>
        <h3>${cat.name}</h3>
        <span class="cat-count">${count} items</span>
      </div>
    `;
  }).join("");

  holder.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const cat = card.dataset.cat;
      activeCategory = activeCategory === cat ? "All" : cat;
      renderCategoryCards(containerId);
      renderChips();
      renderGrid();
      
      const gridEl = document.getElementById("productGrid");
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function renderFarmerSpotlight(containerId = "farmersContainer") {
  const holder = document.getElementById(containerId);
  if (!holder || typeof FARMERS_DATA === "undefined") return;

  holder.innerHTML = FARMERS_DATA.map((f) => `
    <div class="farmer-card">
      <div class="farmer-portrait">
        <img src="${f.photo}" alt="${f.name}" />
      </div>
      <div class="farmer-info">
        <div style="display:flex;align-items:center;gap:6px;">
          <h4>${f.name}</h4>
          <span style="font-size:11px;background:#dcfce7;color:#15803d;padding:1px 6px;border-radius:999px;font-weight:700;">✓ Verified</span>
        </div>
        <p class="location">📍 ${f.location} · ${f.farm}</p>
        <p class="bio">${f.bio}</p>
      </div>
    </div>
  `).join("");
}

function renderChips() {
  const holder = document.getElementById("categoryChips");
  if (!holder) return;

  const categories = ["All", "Vegetables", "Fruits", "Grains", "Pulses", "Dairy"];
  holder.innerHTML = categories.map((c) => `
    <button class="chip ${c === activeCategory ? 'active' : ''}" data-cat="${c}">${c}</button>
  `).join("");

  holder.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.cat;
      renderChips();
      renderCategoryCards();
      renderGrid();
    });
  });
}

function renderGrid(containerId = "productGrid") {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  const products = readStore(STORE.products, []);

  let filtered = products.filter((p) => {
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm)) ||
      (p.farmerName && p.farmerName.toLowerCase().includes(searchTerm));
    return matchesCat && matchesSearch;
  });

  // Sorting
  if (sortBy === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filtered.sort((a, b) => Number(getAverageRating(b).avg) - Number(getAverageRating(a).avg));
  } else if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:white;border-radius:var(--radius-lg);border:1px solid var(--card-border);">
        <div style="font-size:36px;margin-bottom:12px;">🌱</div>
        <h3 style="font-size:1.3rem;margin-bottom:6px;">No farm produce found</h3>
        <p style="color:var(--text-muted);font-size:14px;max-width:400px;margin:0 auto 16px;">We couldn't find anything matching "${searchTerm}". Try choosing another category or keyword.</p>
        <button class="btn btn-outline" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((p) => {
    const ratingData = getAverageRating(p);
    const wishlisted = isWishlisted(p.id);
    const isLowStock = p.stock > 0 && p.stock < 15;

    return `
      <div class="product-card" data-product-id="${p.id}">
        <div class="product-img-box">
          <img src="${p.image || DEFAULT_PRODUCT_IMG}" alt="${p.name}" onerror="this.src='${DEFAULT_PRODUCT_IMG}'" loading="lazy" />
          <span class="product-badge-fresh">${p.harvestDate || "Fresh Harvest"}</span>
          <button class="product-wishlist-btn ${wishlisted ? 'active' : ''}" data-wishlist="${p.id}" title="${wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}">
            ${wishlisted ? '❤️' : '♡'}
          </button>
        </div>

        <div class="product-body">
          <div class="product-meta-row">
            <span class="product-category-tag">${p.category}</span>
            <span class="product-stock-pill ${isLowStock ? 'low' : ''}">
              ${p.stock > 0 ? `${p.stock} ${p.unit} left` : 'Sold out'}
            </span>
          </div>

          <h3 class="product-title" style="cursor:pointer;" onclick="openProductModal(${p.id})">${p.name}</h3>
          
          <div class="product-farmer-tag">
            <span>🧑‍🌾 ${p.farmerName}</span>
            <span style="font-size:11px;color:#94a3b8;">· ${p.farmLocation || "Local Farm"}</span>
          </div>

          <div class="product-rating-box">
            <span class="product-stars">${getStarHTML(ratingData.avg)}</span>
            <span style="font-weight:700;color:var(--text-main);">${ratingData.avg}</span>
            <span style="color:#94a3b8;">(${ratingData.count})</span>
          </div>

          <div class="product-footer-row">
            <div class="product-price-box">
              <span class="product-price">₹${p.price}</span>
              <span class="product-unit">per ${p.unit}</span>
            </div>

            <div class="product-action-btns">
              <button class="btn btn-sm btn-outline" onclick="openProductModal(${p.id})">Details</button>
              <button class="btn btn-sm btn-primary" onclick="addToCart(${p.id}, 1)" ${p.stock <= 0 ? 'disabled' : ''}>
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Attach Wishlist listeners
  grid.querySelectorAll("[data-wishlist]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.wishlist);
      const isNowWish = toggleWishlist(id);
      btn.classList.toggle("active", isNowWish);
      btn.innerHTML = isNowWish ? "❤️" : "♡";
      btn.title = isNowWish ? "Saved in Wishlist" : "Add to Wishlist";
    });
  });
}

function resetFilters() {
  activeCategory = "All";
  searchTerm = "";
  sortBy = "default";
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  const sortSelect = document.getElementById("sortFilter");
  if (sortSelect) sortSelect.value = "default";
  renderChips();
  renderCategoryCards();
  renderGrid();
}

/* ============================================================
   PRODUCT DETAIL MODAL & REVIEWS
   ============================================================ */
function openProductModal(id) {
  selectedModalProductId = id;
  const products = readStore(STORE.products, []);
  const p = products.find((pr) => pr.id === id);
  if (!p) return;

  const modal = document.getElementById("productModal");
  const modalContent = document.getElementById("productModalContent");
  if (!modal || !modalContent) return;

  const ratingData = getAverageRating(p);
  const wishlisted = isWishlisted(p.id);

  const reviewsHTML = (!p.reviews || p.reviews.length === 0)
    ? `<p style="color:#64748b;font-size:13.5px;padding:8px 0;">No reviews yet. Be the first customer to leave a review!</p>`
    : p.reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <strong style="font-size:13.5px;color:var(--text-main);">${r.name}</strong>
          <span style="font-size:12px;color:var(--accent-gold);">${getStarHTML(r.rating)}</span>
        </div>
        <p style="font-size:13px;color:#475569;margin-bottom:4px;">${r.comment}</p>
        <span style="font-size:11px;color:#94a3b8;">${r.date || "Verified Purchase"}</span>
      </div>
    `).join("");

  modalContent.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;">
      <div>
        <div style="border-radius:var(--radius-lg);overflow:hidden;height:280px;background:#f1f5f9;box-shadow:var(--shadow-md);">
          <img src="${p.image || DEFAULT_PRODUCT_IMG}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='${DEFAULT_PRODUCT_IMG}'" alt="${p.name}" />
        </div>
        <div style="margin-top:14px;background:#f8fafc;padding:12px 16px;border-radius:var(--radius-md);border:1px solid var(--card-border);">
          <div style="font-size:12px;font-weight:700;color:var(--primary);text-transform:uppercase;">Harvest Specifications</div>
          <div style="font-size:13px;color:#334155;margin-top:4px;">
            🌿 <strong>Method:</strong> 100% Organic, zero toxic pesticides<br>
            📅 <strong>Harvested:</strong> ${p.harvestDate || "Morning Pick"}<br>
            📍 <strong>Farm:</strong> ${p.farmLocation || "Local Certified Farm"}
          </div>
        </div>
      </div>

      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span class="product-category-tag">${p.category}</span>
          <span class="product-stock-pill ${p.stock < 10 ? 'low' : ''}">${p.stock} ${p.unit} in stock</span>
        </div>

        <h2 style="font-size:1.8rem;margin-bottom:6px;color:var(--primary-dark);">${p.name}</h2>
        <div style="font-size:13px;color:#64748b;margin-bottom:12px;">Grown by <strong>${p.farmerName}</strong> · Direct Harvest</div>

        <div class="product-rating-box" style="margin-bottom:16px;">
          <span class="product-stars">${getStarHTML(ratingData.avg)}</span>
          <span style="font-weight:700;">${ratingData.avg}</span>
          <span>(${ratingData.count} customer reviews)</span>
        </div>

        <div style="font-size:1.75rem;font-weight:800;color:var(--primary);margin-bottom:16px;">
          ₹${p.price} <span style="font-size:14px;color:#64748b;font-weight:500;">/ ${p.unit}</span>
        </div>

        <p style="font-size:14px;color:#475569;line-height:1.6;margin-bottom:20px;">
          ${p.description || "Farm fresh produce picked straight from the field."}
        </p>

        <!-- Quantity & Add to Cart -->
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px;">
          <div class="qty-counter">
            <button onclick="decrementModalQty()">−</button>
            <span id="modalQtyDisplay">1</span>
            <button onclick="incrementModalQty(${p.stock})">+</button>
          </div>
          <button class="btn btn-primary" onclick="addModalItemToCart(${p.id})">
            🛒 Add to Cart
          </button>
          <button class="btn btn-outline" onclick="toggleWishlist(${p.id}); openProductModal(${p.id});">
            ${wishlisted ? '❤️ In Wishlist' : '♡ Save'}
          </button>
        </div>

        <!-- REVIEWS SECTION -->
        <div class="reviews-container">
          <h4 style="font-size:15px;margin-bottom:12px;">Customer Feedback &amp; Reviews</h4>
          <div style="max-height:180px;overflow-y:auto;padding-right:6px;">
            ${reviewsHTML}
          </div>

          <!-- Add Review Form -->
          <div style="margin-top:16px;background:white;border:1px solid var(--card-border);border-radius:var(--radius-md);padding:14px;">
            <h5 style="font-size:13px;margin-bottom:4px;">Write a Review</h5>
            <div class="star-rating-selector" id="modalStarSelector">
              ${[1, 2, 3, 4, 5].map(n => `
                <button type="button" class="star-btn ${n <= selectedModalRating ? 'active' : ''}" onclick="selectModalStar(${n})">★</button>
              `).join("")}
            </div>
            <textarea id="modalReviewComment" class="form-textarea" rows="2" placeholder="How was the freshness, taste, and quality?"></textarea>
            <button class="btn btn-sm btn-secondary" style="margin-top:8px;" onclick="submitProductReview(${p.id})">
              Submit Review ⭐
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
  modal.style.display = "flex";
}

let modalQty = 1;

function decrementModalQty() {
  if (modalQty > 1) {
    modalQty--;
    const el = document.getElementById("modalQtyDisplay");
    if (el) el.textContent = modalQty;
  }
}

function incrementModalQty(maxStock) {
  if (modalQty < maxStock) {
    modalQty++;
    const el = document.getElementById("modalQtyDisplay");
    if (el) el.textContent = modalQty;
  } else {
    toast(`Maximum available quantity is ${maxStock}.`, "warning");
  }
}

function addModalItemToCart(productId) {
  addToCart(productId, modalQty);
  closeProductModal();
}

function closeProductModal() {
  selectedModalProductId = null;
  modalQty = 1;
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
  }
}

function selectModalStar(rating) {
  selectedModalRating = rating;
  const container = document.getElementById("modalStarSelector");
  if (!container) return;
  container.querySelectorAll(".star-btn").forEach((btn, idx) => {
    btn.classList.toggle("active", idx < rating);
  });
}

function submitProductReview(productId) {
  const commentEl = document.getElementById("modalReviewComment");
  const comment = commentEl ? commentEl.value.trim() : "";
  if (!comment) {
    toast("Please write a few words about your experience.", "warning");
    return;
  }

  const user = currentUser();
  const reviewerName = user ? user.name : "Verified Customer";

  const products = readStore(STORE.products, []);
  const p = products.find(pr => pr.id === productId);
  if (!p) return;

  if (!p.reviews) p.reviews = [];
  p.reviews.unshift({
    name: reviewerName,
    rating: selectedModalRating,
    comment: comment,
    date: "Just now"
  });

  writeStore(STORE.products, products);
  toast("Thank you! Review posted successfully ⭐");
  openProductModal(productId);
  renderGrid();
}
