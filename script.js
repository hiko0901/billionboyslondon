// 商品データ
// image   : 画像パスを入れる
// price   : 表示用の価格（請求金額は Stripe に登録した価格で）
// priceId : Stripe の管理画面で商品を作ったときに付く price_xxx の ID
const products = [
  { id: "logo-hoodie",     name: "LOGO HOODIE",     price: "¥2500",   gender: "male",   image: "", priceId: "price_REPLACE_ME" },
  { id: "crew-sweat",      name: "CREW SWEAT",      price: "¥19,000", gender: "male",   image: "", priceId: "price_REPLACE_ME" },
  { id: "wide-cargo-pant", name: "WIDE CARGO PANT", price: "¥28,000", gender: "male",   image: "", priceId: "price_REPLACE_ME" },
  { id: "heavy-tee",       name: "HEAVY TEE",       price: "¥9,800",  gender: "male",   image: "", priceId: "price_REPLACE_ME" },
  { id: "cropped-hoodie",  name: "CROPPED HOODIE",  price: "¥22,000", gender: "female", image: "", priceId: "price_REPLACE_ME" },
  { id: "rib-tank",        name: "RIB TANK",        price: "¥8,800",  gender: "female", image: "", priceId: "price_REPLACE_ME" },
  { id: "track-pant",      name: "TRACK PANT",      price: "¥21,000", gender: "female", image: "", priceId: "price_REPLACE_ME" },
  { id: "baby-tee",        name: "BABY TEE",        price: "¥8,800",  gender: "female", image: "", priceId: "price_REPLACE_ME" },
  { id: "nylon-jacket",    name: "NYLON JACKET",    price: "¥38,000", gender: "male",   image: "", priceId: "price_REPLACE_ME" },
  { id: "knit-beanie",     name: "KNIT BEANIE",     price: "¥7,000",  gender: "male",   image: "", priceId: "price_REPLACE_ME" },
  { id: "long-sleeve-top", name: "LONG SLEEVE TOP", price: "¥14,000", gender: "female", image: "", priceId: "price_REPLACE_ME" },
  { id: "mini-skirt",      name: "MINI SKIRT",      price: "¥18,000", gender: "female", image: "", priceId: "price_REPLACE_ME" },
];

const CART_KEY = "bbl-cart";
const MAX_QTY = 10;

const grid = document.getElementById("products");
const cartCount = document.getElementById("cart-count");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const cartItems = document.getElementById("cart-items");
const checkoutBtn = document.getElementById("checkout-btn");
const cartMessage = document.getElementById("cart-message");

// ---------- 商品 ----------
grid.innerHTML = products.map((p) => `
  <a href="#" class="product" data-id="${p.id}" data-gender="${p.gender}">
    <div class="product-image">
      ${p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy">` : ""}
    </div>
    <div class="product-name">${p.name}</div>
    <div class="product-price">${p.price}</div>
  </a>
`).join("");

grid.addEventListener("click", (e) => {
  const item = e.target.closest(".product");
  if (!item) return;
  e.preventDefault();
  addToCart(item.dataset.id);
  openCart();
});

// ---------- カート（ブラウザ保存） ----------
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
}

let cart = loadCart();

function addToCart(id) {
  cart[id] = Math.min((cart[id] || 0) + 1, MAX_QTY);
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const qty = (cart[id] || 0) + delta;
  if (qty <= 0) delete cart[id];
  else cart[id] = Math.min(qty, MAX_QTY);
  saveCart();
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
    .filter((e) => e.product);

  cartCount.textContent = entries.reduce((sum, e) => sum + e.qty, 0);
  cartMessage.textContent = "";

  if (entries.length === 0) {
    cartItems.innerHTML = `<p class="cart-empty">YOUR CART IS EMPTY</p>`;
    checkoutBtn.disabled = true;
    return;
  }

  cartItems.innerHTML = entries.map(({ product: p, qty }) => `
    <div class="cart-item">
      <div class="cart-item-image">
        ${p.image ? `<img src="${p.image}" alt="${p.name}">` : ""}
      </div>
      <div class="cart-item-info">
        <div>${p.name}</div>
        <div class="product-price">${p.price}</div>
        <div class="cart-qty">
          <button type="button" data-id="${p.id}" data-delta="-1">−</button>
          <span>${qty}</span>
          <button type="button" data-id="${p.id}" data-delta="1">+</button>
        </div>
      </div>
    </div>
  `).join("");
  checkoutBtn.disabled = false;
}

cartItems.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-delta]");
  if (!btn) return;
  changeQty(btn.dataset.id, Number(btn.dataset.delta));
});

// ---------- カートの開け閉め ----------
function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

document.getElementById("cart-open").addEventListener("click", (e) => {
  e.preventDefault();
  openCart();
});
document.getElementById("cart-close").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});

// ---------- Stripe Checkout へ ----------
// 送るのは「Stripe の price ID と数量」　金額は Stripe に登録した価格
checkoutBtn.addEventListener("click", async () => {
  const items = Object.entries(cart)
    .map(([id, quantity]) => ({ priceId: products.find((p) => p.id === id)?.priceId, quantity }))
    .filter((item) => item.priceId);

  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "LOADING...";
  cartMessage.textContent = "";

  try {
    const res = await fetch("/.netlify/functions/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
    window.location.href = data.url;
  } catch (err) {
    console.error(err);
    cartMessage.textContent = "決済画面を開けませんでした。もう一度お試しください。";
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "CHECKOUT";
  }
});

renderCart();


const navButtons = document.querySelectorAll(".gender-nav button");
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const isActive = btn.classList.contains("active");
    navButtons.forEach((b) => b.classList.remove("active"));
    const filter = isActive ? null : btn.dataset.filter;
    if (filter) btn.classList.add("active");

    document.querySelectorAll(".product").forEach((el) => {
      el.classList.toggle("hidden", filter && el.dataset.gender !== filter);
    });
    grid.scrollIntoView({ behavior: "smooth" });
  });
});
