import {
  getCart,
  getTotal,
  getCount,
  removeFromCart,
  updateQty,
} from "./cart.js";

export function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const countEl = document.getElementById("cartCount");
  if (!itemsEl) return;

  const cart = getCart();
  if (countEl) countEl.textContent = getCount();
  if (totalEl)
    totalEl.textContent = `جمع: ${getTotal().toLocaleString()} تومان`;

  if (!cart.length) {
    itemsEl.innerHTML = emptyCartHTML();
    return;
  }

  itemsEl.innerHTML = cart
    .map((item) => {
      // ⬇️ مهم: از cartId استفاده کن، اگه نبود از id
      const cartId = item.cartId || String(item.id);
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="cart-item-content">
            <div class="cart-item-name">${item.name}</div>
            ${item.size ? `<div class="cart-item-size">سایز: ${item.size}</div>` : ""}
            <div class="cart-item-price">${item.price.toLocaleString()} تومان</div>

            <div class="cart-item-actions">
              <div class="qty-control">
                <button class="qty-btn" data-inc="${cartId}" aria-label="افزایش">+</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" data-dec="${cartId}" aria-label="کاهش">−</button>
              </div>
              <button class="cart-item-remove" data-remove="${cartId}" title="حذف">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
                  <path d="M10 11v6M14 11v6"></path>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  itemsEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.remove); // dataset همیشه رشته‌ست
    });
  });

  itemsEl.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateQty(btn.dataset.inc, +1);
    });
  });

  itemsEl.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateQty(btn.dataset.dec, -1);
    });
  });
}

export function setupCartToggle() {
  const btn = document.getElementById("cartBtn");
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  if (!btn || !sidebar || !overlay) return;

  const toggle = (open) => {
    sidebar.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
  };

  btn.addEventListener("click", () => toggle(true));
  overlay.addEventListener("click", () => toggle(false));
}

export function updateAuthLink() {
  const link = document.getElementById("authLink");
  if (!link) return;

  const user = JSON.parse(localStorage.getItem("hl_user") || "null");

  if (user) {
    link.textContent = user.name || "داشبورد";
    link.href = "dashboard.html";
  } else {
    link.textContent = "ورود";
    link.href = "login.html";
  }
}

export function showToast(msg) {
  const el = document.createElement("div");
  el.className =
    "fixed bottom-4 right-4 bg-brand text-white px-5 py-3 rounded-lg shadow-lg z-[300]";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

/* ============================================ */
/* ===== Skeleton Loader ======================= */
/* ============================================ */

export function skeletonCardHTML() {
  return `
    <div class="skeleton-card">
      <div class="skeleton skeleton-card-image"></div>
      <div class="skeleton-card-body">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-price"></div>
        <div class="skeleton skeleton-btn"></div>
      </div>
    </div>
  `;
}

export function renderProductSkeletons(container, count = 8) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count })
    .map(() => skeletonCardHTML())
    .join("");
}

export function renderDealSkeletons(container, count = 4) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count })
    .map(
      () => `
      <div class="skeleton-card skeleton-card-deal">
        <div class="skeleton skeleton-card-image"></div>
        <div class="skeleton-card-body">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-price"></div>
        </div>
      </div>
    `,
    )
    .join("");
}

export function renderTableSkeletons(tbody, rows = 3) {
  if (!tbody) return;
  tbody.innerHTML = Array.from({ length: rows })
    .map(
      () => `
      <tr>
        <td colspan="5" style="padding:0">
          <div class="skeleton-row">
            <div class="skeleton skeleton-cell"></div>
            <div class="skeleton skeleton-cell"></div>
            <div class="skeleton skeleton-cell"></div>
            <div class="skeleton skeleton-cell"></div>
            <div class="skeleton skeleton-cell"></div>
          </div>
        </td>
      </tr>
    `,
    )
    .join("");
}

export function renderProductDetailSkeleton(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="skeleton-detail">
      <div class="skeleton skeleton-detail-image"></div>
      <div class="skeleton-detail-body">
        <div class="skeleton skeleton-detail-title"></div>
        <div class="skeleton skeleton-detail-text"></div>
        <div class="skeleton skeleton-detail-text"></div>
        <div class="skeleton skeleton-detail-text-short"></div>
        <div class="skeleton skeleton-detail-btn"></div>
      </div>
    </div>
  `;
}

/* ============================================ */
/* ===== Recently Viewed (اخیراً دیدید) ======== */
/* ============================================ */

export function recentlyCardHTML(p) {
  const discount = p.oldPrice
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0;
  return `
    <div class="recently-card">
      ${discount ? `<span class="badge-discount">${discount}٪</span>` : ""}
      <a href="product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </a>
      <div class="recently-card-body">
        <div class="recently-card-title">${p.name}</div>
        <div class="recently-card-price">
          ${p.oldPrice ? `<span class="old">${p.oldPrice.toLocaleString()}</span>` : ""}
          <span class="new">${p.price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;
}

export function renderRecentlyViewed(container, excludeId = null) {
  if (!container) return;

  // ⬇️ پیدا کردن والد section برای نمایش/مخفی کردن
  const section =
    container.closest(".recently-section") || container.parentElement;

  let items = [];
  try {
    items = JSON.parse(localStorage.getItem("hl_recently") || "[]");
  } catch {
    items = [];
  }

  if (excludeId) {
    items = items.filter((p) => p.id !== excludeId);
  }

  if (!items.length) {
    container.innerHTML = "";
    if (section) section.style.display = "none";
    return;
  }

  if (section) section.style.display = "";
  container.innerHTML = items.map(recentlyCardHTML).join("");
}

/* ============================================ */
/* ===== انیمیشن پرواز به سبد ================= */
/* ============================================ */

export function flyToCart(sourceEl, product) {
  // اگه منبع یا عکس نداریم، برنگرد
  if (!sourceEl || !product || !product.image) return;

  const cartBtn = document.getElementById("cartBtn");
  if (!cartBtn) return;

  // موقعیت مبدأ (دکمه یا کارت محصول)
  const sourceRect = sourceEl.getBoundingClientRect();

  // موقعیت مقصد (آیکون سبد توی هدر)
  const targetRect = cartBtn.getBoundingClientRect();

  // اندازه‌ی اولیه (کوچیک شروع می‌شه)
  const startSize = 48;
  const endSize = 24;

  // ساخت المان پرواز
  const flyer = document.createElement("div");
  flyer.className = "fly-to-cart";
  flyer.style.backgroundImage = `url(${product.image})`;
  flyer.style.width = `${startSize}px`;
  flyer.style.height = `${startSize}px`;
  flyer.style.top = `${sourceRect.top + sourceRect.height / 2 - startSize / 2}px`;
  flyer.style.left = `${sourceRect.left + sourceRect.width / 2 - startSize / 2}px`;

  document.body.appendChild(flyer);

  // محاسبه‌ی مسیر پرواز با requestAnimationFrame
  const startX = sourceRect.left + sourceRect.width / 2;
  const startY = sourceRect.top + sourceRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  // یه نقطه‌ی میانی برای قوس (بالاتر از خط مستقیم)
  const midX = deltaX * 0.5;
  const midY = deltaY - 100; // ۱۰۰ پیکسل بالاتر

  const duration = 700; // میلی‌ثانیه
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // منحنی ease-in-out
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // مسیر بزیه (Bezier curve)
    const t = eased;
    const x = startX + deltaX * t;
    // استفاده از معادله‌ی سهمی برای قوس
    const y = startY + deltaY * t - Math.sin(Math.PI * t) * 100;

    // اندازه‌ی فعلی
    const size = startSize + (endSize - startSize) * t;

    flyer.style.left = `${x - size / 2}px`;
    flyer.style.top = `${y - size / 2}px`;
    flyer.style.width = `${size}px`;
    flyer.style.height = `${size}px`;
    flyer.style.opacity = `${1 - t * 0.3}`; // کمی محو
    flyer.style.transform = `rotate(${t * 360}deg)`; // چرخش

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      flyer.remove();
      pulseCartIcon();
    }
  }

  requestAnimationFrame(animate);
}

// پالس آیکون سبد
function pulseCartIcon() {
  const cartBtn = document.getElementById("cartBtn");
  if (!cartBtn) return;

  cartBtn.classList.add("cart-pulse");
  setTimeout(() => cartBtn.classList.remove("cart-pulse"), 600);
}
/* ============================================ */
/* ===== انیمیشن سبد خالی ===================== */
/* ============================================ */

export function emptyCartHTML() {
  return `
    <div class="empty-cart">
      <svg class="empty-cart-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <!-- ستاره‌ها / جرقه‌ها -->
        <circle class="spark spark-1" cx="20" cy="30" r="2.5" fill="#ff6b81" />
        <circle class="spark spark-2" cx="100" cy="25" r="2" fill="#ff6b81" />
        <circle class="spark spark-3" cx="15" cy="80" r="2" fill="#e54861" />
        <circle class="spark spark-4" cx="105" cy="85" r="2.5" fill="#e54861" />
        <circle class="spark spark-5" cx="60" cy="10" r="2" fill="#ff6b81" />

        <!-- سبد -->
        <g class="cart-icon-group">
          <!-- دسته‌ی سبد -->
          <path class="cart-handle" d="M40 40 L45 55 M80 40 L75 55" stroke="#e54861" stroke-width="3" stroke-linecap="round" fill="none" />

          <!-- بدنه‌ی سبد -->
          <path class="cart-body" d="M30 50 L90 50 L82 95 Q81 100 76 100 L44 100 Q39 100 38 95 Z"
                fill="#fff1f3" stroke="#ff6b81" stroke-width="3" stroke-linejoin="round" />

          <!-- خطوط عمودی بدنه -->
          <line class="cart-line" x1="50" y1="60" x2="52" y2="90" stroke="#ff6b81" stroke-width="2" stroke-linecap="round" />
          <line class="cart-line" x1="60" y1="60" x2="60" y2="90" stroke="#ff6b81" stroke-width="2" stroke-linecap="round" />
          <line class="cart-line" x1="70" y1="60" x2="68" y2="90" stroke="#ff6b81" stroke-width="2" stroke-linecap="round" />
        </g>
      </svg>

      <p class="empty-cart-text">سبد خرید شما خالی است</p>
      <p class="empty-cart-sub">هنوز محصولی به سبد اضافه نکرده‌اید</p>
      <a href="products.html" class="btn-brand empty-cart-btn">مشاهده محصولات</a>
    </div>
  `;
}
