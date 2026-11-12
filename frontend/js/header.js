// هدر مشترک — با آواتار تعاملی برای کاربر لاگین‌شده
export function renderHeader(options = {}) {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const { showCart = true, showAuth = true } = options;

  const path = window.location.pathname.split("/").pop() || "index.html";

  const isActive = (page) => {
    if (page === "index.html" && (path === "" || path === "index.html"))
      return true;
    return path === page;
  };

  const activeClass = (page) =>
    isActive(page) ? "text-brand font-semibold" : "hover:text-brand";

  const user = JSON.parse(localStorage.getItem("hl_user") || "null");

  // ⬇️ ساخت دکمه‌ی auth با آواتار
  let authHTML = "";
  if (showAuth) {
    if (user) {
      const initial = (user.name || "U").trim().charAt(0).toUpperCase();
      authHTML = `
        <div class="avatar-wrap" id="avatarWrap">
          <button class="avatar-btn" id="avatarBtn" aria-label="منوی کاربر" aria-haspopup="true" aria-expanded="false">
            <span class="avatar-circle">${initial}</span>
          </button>
          <div class="avatar-menu" id="avatarMenu" role="menu">
            <div class="avatar-menu-header">
              <span class="avatar-circle avatar-circle-lg">${initial}</span>
              <div class="avatar-user-info">
                <div class="avatar-user-name">${user.name || "کاربر"}</div>
                <div class="avatar-user-email">${user.email || ""}</div>
              </div>
            </div>
            <div class="avatar-menu-divider"></div>
            <a href="dashboard.html" class="avatar-menu-item" role="menuitem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              داشبورد
            </a>
            <a href="favorites.html" class="avatar-menu-item" role="menuitem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              علاقه‌مندی‌ها
            </a>
            <a href="dashboard.html#orders" class="avatar-menu-item" role="menuitem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              سفارش‌ها
            </a>
            <div class="avatar-menu-divider"></div>
            <button id="logoutBtn" class="avatar-menu-item avatar-menu-logout" role="menuitem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              خروج
            </button>
          </div>
        </div>
      `;
    } else {
      authHTML = `<a href="login.html" id="authLink" class="btn-outline header-auth-btn">ورود</a>`;
    }
  }

  const cartHTML = showCart
    ? `<button id="cartBtn" class="header-cart-btn" aria-label="سبد خرید">
         🛍
         <span id="cartCount" class="header-cart-count">0</span>
       </button>`
    : "";

  header.innerHTML = `
    <div class="header-inner">
      <a href="index.html" class="header-logo">🎈 Happy Land</a>

      <nav class="site-nav">
        <a href="index.html" class="${activeClass("index.html")}">خانه</a>
        <a href="products.html" class="${activeClass("products.html")}">محصولات</a>
        <a href="favorites.html" class="${activeClass("favorites.html")}">❤ علاقه‌مندی‌ها</a>
        <a href="about.html" class="${activeClass("about.html")}">درباره ما</a>
        <a href="contact.html" class="${activeClass("contact.html")}">تماس با ما</a>
      </nav>

      <div class="header-actions">
        <button id="themeToggle" class="theme-toggle" aria-label="تغییر تم" title="تغییر تم">🌙</button>
        ${cartHTML}
        ${authHTML}
      </div>
    </div>
  `;

  // ⬇️ فعال‌سازی منوی آواتار
  if (user && showAuth) {
    setupAvatarMenu();
  }
}

/* ============================================ */
/* ===== منوی آواتار =========================== */
/* ============================================ */

function setupAvatarMenu() {
  const btn = document.getElementById("avatarBtn");
  const menu = document.getElementById("avatarMenu");
  const wrap = document.getElementById("avatarWrap");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!btn || !menu || !wrap) return;

  // toggle منو
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains("open");
    menu.classList.toggle("open", !isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
  });

  // بستن با کلیک بیرون
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  // بستن با Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  // خروج
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("hl_user");
      localStorage.removeItem("hl_token");
      window.location.href = "index.html";
    });
  }
}
