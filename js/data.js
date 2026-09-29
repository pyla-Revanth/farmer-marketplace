/* ============================================================
   data.js — Seed Data, Real Produce Images, & Store Helpers
   Shared across all pages. Real photos, zero icons.
   ============================================================ */

const STORE = {
  users: "sfm_users",
  products: "sfm_products",
  cart: "sfm_cart",
  wishlist: "sfm_wishlist",
  orders: "sfm_orders",
  currentUser: "sfm_currentUser",
};

/* Curated, high-resolution direct produce photos (reliable Unsplash images) */
const PRESET_PRODUCE_IMAGES = [
  { label: "Tomatoes", url: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80" },
  { label: "Potatoes", url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80" },
  { label: "Onions", url: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80" },
  { label: "Carrots", url: "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=800&q=80" },
  { label: "Mangoes", url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80" },
  { label: "Bananas", url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80" },
  { label: "Rice", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80" },
  { label: "Green Chillies", url: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80" },
  { label: "Spinach", url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80" },
  { label: "Fresh Milk", url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80" },
  { label: "Papaya", url: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=80" },
  { label: "Strawberries", url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80" },
  { label: "Green Gram", url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80" },
  { label: "Bell Peppers", url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80" },
];

/* Real categories with actual photographic covers */
const CATEGORIES_DATA = [
  { name: "Vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80", count: "12+ varieties" },
  { name: "Fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80", count: "8+ varieties" },
  { name: "Grains", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80", count: "6+ varieties" },
  { name: "Pulses", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", count: "5+ varieties" },
  { name: "Dairy", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80", count: "Farm fresh" },
];

/* Verified Real Farmers (Reference Image 2 & 5) */
const FARMERS_DATA = [
  {
    id: 1,
    name: "Ramesh Yadav",
    farm: "Guntur Organic Valley",
    location: "Guntur, AP",
    experience: "15 years farming",
    photo: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=400&q=80",
    bio: "Specializes in heirloom tomatoes, organic basmati rice and pesticide-free leafy greens.",
  },
  {
    id: 2,
    name: "Suresh Patil",
    farm: "Nashik Greenfield Orchards",
    location: "Nashik, MH",
    experience: "12 years farming",
    photo: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80",
    bio: "Expert in seasonal Alphonso mangoes, organic pulses and direct-to-home pure A2 dairy.",
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    farm: "Sun Valley Natural Co-op",
    location: "Ooty Valley",
    experience: "8 years farming",
    photo: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=400&q=80",
    bio: "Pioneer in zero-chemical hydroponic strawberries, fresh baby carrots and bell peppers.",
  },
];

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* Fallback image helper */
const DEFAULT_PRODUCT_IMG = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

function seedIfEmpty() {
  // Seed Users
  if (!localStorage.getItem(STORE.users)) {
    writeStore(STORE.users, [
      { id: 1, name: "Ramesh Yadav", email: "ramesh@farm.com", password: "demo123", role: "farmer", phone: "+91 98451 22345" },
      { id: 2, name: "Suresh Patil", email: "suresh@farm.com", password: "demo123", role: "farmer", phone: "+91 98452 33456" },
      { id: 3, name: "Sarah Jenkins", email: "sarah@farm.com", password: "demo123", role: "farmer", phone: "+91 98453 44567" },
      { id: 4, name: "Priya Nair", email: "priya@buyer.com", password: "demo123", role: "customer", phone: "+91 97412 88990" },
    ]);
  }

  // Seed Products with REAL photos (not icons!)
  const existingProds = readStore(STORE.products, null);
  // Migrate if empty or if existing data still uses icon keys without real image URLs
  const needsImageMigration = !existingProds || existingProds.some(p => !p.image || p.image.length < 5);

  if (needsImageMigration) {
    writeStore(STORE.products, [
      {
        id: 1,
        name: "Fresh Vine Tomatoes",
        category: "Vegetables",
        price: 40,
        unit: "kg",
        stock: 120,
        farmerId: 1,
        farmerName: "Ramesh Yadav",
        farmLocation: "Guntur Valley",
        image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80",
        description: "Naturally ripened vine tomatoes picked this morning. Rich in flavour, firm skin, and perfect for fresh salads or rich gravies.",
        harvestDate: "Today's Harvest",
        reviews: [
          { name: "Priya Nair", rating: 5, comment: "Incredibly fresh and juicy! Delivered within hours of picking.", date: "Yesterday" },
          { name: "Anil Kumar", rating: 5, comment: "Much better taste than supermarket cold-storage tomatoes.", date: "3 days ago" },
        ]
      },
      {
        id: 2,
        name: "Organic Sona Masoori Rice",
        category: "Grains",
        price: 70,
        unit: "kg",
        stock: 80,
        farmerId: 2,
        farmerName: "Suresh Patil",
        farmLocation: "Nashik Valley",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
        description: "Naturally grown, sun-dried organic rice without chemical polishing. Retains its wholesome bran and authentic aroma.",
        harvestDate: "Aged 6 Months",
        reviews: [
          { name: "Rohit Sharma", rating: 5, comment: "Light, fluffy and very clean grain.", date: "2 days ago" }
        ]
      },
      {
        id: 3,
        name: "Sweet Alphonso Mangoes",
        category: "Fruits",
        price: 120,
        unit: "kg",
        stock: 25,
        farmerId: 2,
        farmerName: "Suresh Patil",
        farmLocation: "Nashik Orchards",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
        description: "Grade-A GI-tagged Alphonso mangoes. Tree-ripened with zero calcium carbide or chemical gas chambers.",
        harvestDate: "Harvested Yesterday",
        reviews: [
          { name: "Meera Sen", rating: 5, comment: "Heavenly aroma and sweetness. The whole room smelled like mangoes!", date: "1 day ago" }
        ]
      },
      {
        id: 4,
        name: "Farm Fresh Green Chillies",
        category: "Vegetables",
        price: 60,
        unit: "kg",
        stock: 45,
        farmerId: 1,
        farmerName: "Ramesh Yadav",
        farmLocation: "Guntur Valley",
        image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80",
        description: "Crisp and medium-hot green chillies harvested fresh twice a week. Free from artificial green color coatings.",
        harvestDate: "Today's Harvest",
        reviews: []
      },
      {
        id: 5,
        name: "Crisp Organic Spinach",
        category: "Vegetables",
        price: 30,
        unit: "bunch",
        stock: 65,
        farmerId: 1,
        farmerName: "Ramesh Yadav",
        farmLocation: "Guntur Valley",
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
        description: "Dark emerald, tender spinach leaves harvested at dawn. Washed in clean mountain spring water and bunched with natural twine.",
        harvestDate: "Morning Harvest",
        reviews: [
          { name: "Priya Nair", rating: 5, comment: "Zero wilted leaves, very crunchy and fresh.", date: "Today" }
        ]
      },
      {
        id: 6,
        name: "Pure Farm A2 Cow Milk",
        category: "Dairy",
        price: 65,
        unit: "litre",
        stock: 35,
        farmerId: 2,
        farmerName: "Suresh Patil",
        farmLocation: "Nashik Valley",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
        description: "Raw chilled A2 milk from free-grazing indigenous Gir cows. Bottled in sterilised glass and kept strictly under 4°C.",
        harvestDate: "Milked 5:00 AM",
        reviews: [
          { name: "Deepak V.", rating: 5, comment: "Thick natural cream layer on top, purest milk in town.", date: "2 days ago" }
        ]
      },
      {
        id: 7,
        name: "Crunchy Farm Carrots",
        category: "Vegetables",
        price: 50,
        unit: "kg",
        stock: 90,
        farmerId: 3,
        farmerName: "Sarah Jenkins",
        farmLocation: "Sun Valley Natural Co-op",
        image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=800&q=80",
        description: "Bright orange, naturally sweet soil-grown carrots. High in beta-carotene and freshly pulled from compost-fed beds.",
        harvestDate: "Picked Yesterday",
        reviews: []
      },
      {
        id: 8,
        name: "Sun-Ripened Papaya",
        category: "Fruits",
        price: 45,
        unit: "kg",
        stock: 30,
        farmerId: 2,
        farmerName: "Suresh Patil",
        farmLocation: "Nashik Orchards",
        image: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=80",
        description: "Butter-soft, sweet red-lady papaya. Tree-ripened and packed in protective hay cushions.",
        harvestDate: "Today's Harvest",
        reviews: []
      },
      {
        id: 9,
        name: "Organic Green Gram (Moong)",
        category: "Pulses",
        price: 110,
        unit: "kg",
        stock: 55,
        farmerId: 1,
        farmerName: "Ramesh Yadav",
        farmLocation: "Guntur Valley",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        description: "Whole green moong pulses. High in protein, easy to sprout, grown without chemical pest controls.",
        harvestDate: "Fresh Harvest Season",
        reviews: []
      },
      {
        id: 10,
        name: "Fresh Hand-Picked Strawberries",
        category: "Fruits",
        price: 140,
        unit: "box",
        stock: 20,
        farmerId: 3,
        farmerName: "Sarah Jenkins",
        farmLocation: "Sun Valley Natural Co-op",
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
        description: "Delicate, fragrant red strawberries picked early morning. Sweet, slightly tart, packed in eco-friendly vented punnets.",
        harvestDate: "Morning Harvest",
        reviews: [
          { name: "Kavita R.", rating: 5, comment: "Super sweet and zero bruises. Best strawberries ever!", date: "Today" }
        ]
      },
      {
        id: 11,
        name: "Organic Yellow Bananas",
        category: "Fruits",
        price: 55,
        unit: "dozen",
        stock: 60,
        farmerId: 2,
        farmerName: "Suresh Patil",
        farmLocation: "Nashik Valley",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
        description: "Small native Yelakki bananas. Natural sugar sweetness, soft texture and rich in potassium.",
        harvestDate: "Fresh Harvest",
        reviews: []
      },
      {
        id: 12,
        name: "Fresh Crisp Bell Peppers",
        category: "Vegetables",
        price: 75,
        unit: "kg",
        stock: 40,
        farmerId: 3,
        farmerName: "Sarah Jenkins",
        farmLocation: "Sun Valley Natural Co-op",
        image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80",
        description: "Glossy, thick-walled green and red bell peppers with maximum crunch and sweetness.",
        harvestDate: "Today's Harvest",
        reviews: []
      }
    ]);
  }

  // Seed Cart & Wishlist
  if (!localStorage.getItem(STORE.cart)) writeStore(STORE.cart, []);
  if (!localStorage.getItem(STORE.wishlist)) writeStore(STORE.wishlist, [1, 3]);

  // Seed Orders with full status progression
  if (!localStorage.getItem(STORE.orders)) {
    writeStore(STORE.orders, [
      {
        id: "ORD-9421",
        date: "26 Sep 2026, 10:30 AM",
        farmerId: 1,
        farmerName: "Ramesh Yadav",
        customerName: "Priya Nair",
        phone: "+91 97412 88990",
        address: "Flat 402, Green Meadows, Hyderabad - 500084",
        items: [
          { productId: 1, name: "Fresh Vine Tomatoes", qty: 3, unit: "kg", price: 40, image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80" },
          { productId: 5, name: "Crisp Organic Spinach", qty: 2, unit: "bunch", price: 30, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80" }
        ],
        total: 180,
        status: "Confirmed", // Steps: Order Placed -> Confirmed -> Packed -> Shipped -> Delivered
      },
      {
        id: "ORD-8812",
        date: "25 Sep 2026, 04:15 PM",
        farmerId: 2,
        farmerName: "Suresh Patil",
        customerName: "Rohit Sharma",
        phone: "+91 98200 11223",
        address: "Villa 12, Palm Grove, Hyderabad - 500033",
        items: [
          { productId: 3, name: "Sweet Alphonso Mangoes", qty: 2, unit: "kg", price: 120, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80" },
          { productId: 6, name: "Pure Farm A2 Cow Milk", qty: 2, unit: "litre", price: 65, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80" }
        ],
        total: 370,
        status: "Delivered",
      }
    ]);
  }
}
seedIfEmpty();

/* Auth Helpers */
function currentUser() {
  return readStore(STORE.currentUser, null);
}

function setCurrentUser(user) {
  writeStore(STORE.currentUser, user);
}

function logout() {
  localStorage.removeItem(STORE.currentUser);
  window.location.href = "auth.html";
}

/* Cart Helpers */
function cartCount() {
  return readStore(STORE.cart, []).reduce((sum, i) => sum + i.quantity, 0);
}

function addToCart(productId, quantity = 1) {
  const products = readStore(STORE.products, []);
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  if (product.stock <= 0) {
    toast(`Sorry, ${product.name} is currently out of stock.`, "error");
    return;
  }

  const cart = readStore(STORE.cart, []);
  const existing = cart.find((i) => i.productId === productId);
  if (existing) {
    if (existing.quantity + quantity > product.stock) {
      toast(`Max available stock reached (${product.stock} ${product.unit}).`, "warning");
      return;
    }
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity: Math.min(quantity, product.stock) });
  }

  writeStore(STORE.cart, cart);
  renderNavCounts();
  toast(`🛒 Added ${quantity} ${product.unit} ${product.name} to your basket!`);
}

/* Wishlist Helpers */
function wishlistCount() {
  return readStore(STORE.wishlist, []).length;
}

function isWishlisted(productId) {
  const list = readStore(STORE.wishlist, []);
  return list.includes(productId);
}

function toggleWishlist(productId) {
  let list = readStore(STORE.wishlist, []);
  const index = list.indexOf(productId);
  const products = readStore(STORE.products, []);
  const prod = products.find(p => p.id === productId);
  const title = prod ? prod.name : "Product";

  if (index === -1) {
    list.push(productId);
    toast(`❤️ Saved ${title} to your Wishlist!`);
  } else {
    list.splice(index, 1);
    toast(`Removed ${title} from your Wishlist.`);
  }

  writeStore(STORE.wishlist, list);
  renderNavCounts();
  return isWishlisted(productId);
}

/* Rating calculation helper */
function getAverageRating(product) {
  if (!product.reviews || product.reviews.length === 0) return { avg: "4.8", count: 0 };
  const sum = product.reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
  return {
    avg: (sum / product.reviews.length).toFixed(1),
    count: product.reviews.length
  };
}

function getStarHTML(ratingNum) {
  const rounded = Math.round(Number(ratingNum) || 5);
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= rounded ? "★" : "☆";
  }
  return stars;
}

/* Shared Toast */
function toast(msg, type = "success") {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
  
  let icon = "✓";
  if (type === "warning") icon = "⚠️";
  if (type === "error") icon = "✕";

  el.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
  el.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

/* Updates Cart & Wishlist counts in nav automatically */
function renderNavCounts() {
  const cartEl = document.getElementById("navCartCount");
  if (cartEl) cartEl.textContent = cartCount();
  const wishEl = document.getElementById("navWishCount");
  if (wishEl) wishEl.textContent = wishlistCount();
}

/* Shared Nav Auth-State Renderer */
function renderNavAuth(navSlotId = "navAuthSlot") {
  const slot = document.getElementById(navSlotId);
  renderNavCounts();
  if (!slot) return;
  const user = currentUser();

  if (user) {
    const isFarmer = user.role === "farmer";
    slot.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:13.5px;font-weight:600;color:#1e293b;">
          👋 ${user.name.split(" ")[0]}
          <span style="font-size:11px;background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:999px;margin-left:4px;font-weight:700;">
            ${isFarmer ? "👨‍🌾 Farmer" : "🛒 Buyer"}
          </span>
        </span>
        ${isFarmer ? '<a class="btn btn-sm btn-primary" href="farmer-dashboard.html">Dashboard</a>' : '<a class="btn btn-sm btn-outline-primary" href="auth.html?mode=farmer">Sell Produce</a>'}
        <button id="logoutBtn" class="btn btn-sm btn-outline" style="padding:4px 10px;font-size:12px;">Logout</button>
      </div>
    `;
    const btn = document.getElementById("logoutBtn");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    }
  } else {
    slot.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <a href="auth.html" class="nav-link" style="padding:6px 14px;">Sign in</a>
        <a href="auth.html?mode=farmer" class="btn btn-sm btn-primary">Become a Farmer</a>
      </div>
    `;
  }
}
