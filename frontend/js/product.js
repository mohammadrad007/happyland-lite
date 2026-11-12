import { fetchProduct } from "./api.js";
import { addToCart } from "./cart.js";
import {
  showToast,
  renderProductDetailSkeleton,
  renderRecentlyViewed,
  flyToCart,
} from "./ui.js";
import { addToRecentlyViewed } from "./recently.js";

const id = new URLSearchParams(location.search).get("id");
const el = document.getElementById("productDetail");
const recentlyEl = document.getElementById("recentlySection");

// ⬇️ state
let selectedSize = null;
let quantity = 1;
let productData = null;

renderProductDetailSkeleton(el);

try {
  const p = await fetchProduct(id);
  productData = p;

  const discount = p.oldPrice
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0;

  el.innerHTML = `
    <div class="product-detail">
      <div class="product-gallery">
        <img src="${p.image}" alt="${p.name}" class="main-image" />
      </div>

      <div class="product-info">
        <h1 class="product-title">${p.name}</h1>
        <p class="product-desc">${p.description}</p>

        <div class="price-box">
          ${p.oldPrice ? `<span class="price-old">${p.oldPrice.toLocaleString()}</span>` : ""}
          <span class="price-new">${p.price.toLocaleString()} تومان</span>
          ${discount ? `<span class="discount-badge">${discount}٪ تخفیف</span>` : ""}
        </div>

        ${
          p.sizes && p.sizes.length
            ? `
          <div class="option-group">
            <label class="option-label">انتخاب سایز:</label>
            <div class="size-options" id="sizeOptions">
              ${p.sizes
                .map(
                  (s) => `
                <button type="button" class="size-btn" data-size="${s}">${s}</button>
              `,
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        <div class="option-group">
          <label class="option-label">تعداد:</label>
          <div class="qty-control">
            <button type="button" class="qty-btn" id="qtyMinus" aria-label="کاهش">−</button>
            <span class="qty-value" id="qtyValue">1</span>
            <button type="button" class="qty-btn" id="qtyPlus" aria-label="افزایش">+</button>
          </div>
        </div>

        <button id="addBtn" class="btn-brand w-full product-add-btn">
          افزودن به سبد
        </button>

        <div class="product-features">
          <div class="feature-item">
            <span class="feature-emoji">🚚</span>
            <span>ارسال رایگان بالای ۵۰۰ هزار تومان</span>
          </div>
          <div class="feature-item">
            <span class="feature-emoji">🔄</span>
            <span>۷ روز ضمانت بازگشت</span>
          </div>
          <div class="feature-item">
            <span class="feature-emoji">✅</span>
            <span>تضمین اصالت کالا</span>
          </div>
        </div>
      </div>
    </div>`;

  // ⬇️ listener سایز
  const sizeButtons = document.querySelectorAll(".size-btn");
  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSize = btn.dataset.size;
    });
  });

  // ⬇️ listener تعداد
  const qtyValueEl = document.getElementById("qtyValue");
  const qtyPlus = document.getElementById("qtyPlus");
  const qtyMinus = document.getElementById("qtyMinus");

  qtyPlus.addEventListener("click", () => {
    quantity++;
    qtyValueEl.textContent = quantity;
    qtyValueEl.classList.add("bump");
    setTimeout(() => qtyValueEl.classList.remove("bump"), 250);
  });

  qtyMinus.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      qtyValueEl.textContent = quantity;
      qtyValueEl.classList.add("bump");
      setTimeout(() => qtyValueEl.classList.remove("bump"), 250);
    }
  });

  // ⬇️ دکمه‌ی افزودن به سبد
  document.getElementById("addBtn").addEventListener("click", (e) => {
    const btn = e.currentTarget;

    // اگه سایز داره ولی انتخاب نشده
    if (p.sizes && p.sizes.length && !selectedSize) {
      showToast("لطفاً سایز را انتخاب کنید");
      document.getElementById("sizeOptions")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    flyToCart(btn, p);

    setTimeout(() => {
      addToCart(p, quantity, selectedSize); // ⬅️ پارامتر سوم: سایز
      showToast(`${quantity} عدد به سبد اضافه شد ✅`);
    }, 350);
  });
  // ⬇️ ثبت در recently
  addToRecentlyViewed(p);

  // ⬇️ نمایش recently (بدون محصول فعلی)
  if (recentlyEl) {
    renderRecentlyViewed(
      recentlyEl.querySelector("[data-recently-grid]"),
      p.id,
    );
    const grid = recentlyEl.querySelector("[data-recently-grid]");
    if (grid && !grid.innerHTML.trim()) {
      recentlyEl.style.display = "none";
    }
  }
} catch (err) {
  el.innerHTML = '<p class="py-10 text-center text-muted">محصول یافت نشد.</p>';
}

/* ============================================ */
/* ===== افزودن به سبد با سایز و تعداد ========= */
/* ============================================ */

function addToCartWithSize(product, qty, size) {
  // کلید یکتا: id + size
  const uniqueId = size ? `${product.id}-${size}` : `${product.id}`;

  const cart = JSON.parse(localStorage.getItem("hl_cart") || "[]");

  const existing = cart.find((i) => i.cartId === uniqueId);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      cartId: uniqueId,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size || null,
      qty,
    });
  }

  localStorage.setItem("hl_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart:change"));
}
