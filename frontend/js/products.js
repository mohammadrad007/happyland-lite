import {
  fetchProducts,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "./api.js";
import { addToCart } from "./cart.js";
import {
  showToast,
  renderProductSkeletons,
  skeletonCardHTML,
  renderRecentlyViewed,
  flyToCart,
} from "./ui.js";

const user = JSON.parse(localStorage.getItem("hl_user") || "null");

const PAGE_SIZE = 8;

const state = {
  category: "all",
  min: "",
  max: "",
  sort: "",
  favorites: new Set(),
  q: "",
  // ⬇️ state مربوط به infinite scroll
  page: 1,
  hasMore: true,
  loading: false,
  products: [], // محصولات لود شده تا الان
};

let observer = null; // برای IntersectionObserver

// ---- ساخت HTML کارت ----
const cardHTML = (p) => {
  const isFav = state.favorites.has(p.id);
  const discount = p.oldPrice
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0;
  return `
    <div class="product-card relative">
      ${discount ? `<span class="badge-discount">${discount}٪</span>` : ""}
      <button class="fav-btn ${isFav ? "active" : ""}" data-fav="${p.id}" title="علاقه‌مندی">
        ${isFav ? "♥" : "♡"}
      </button>
      <a href="product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </a>
      <div class="p-4 flex flex-col gap-2 flex-1">
        <div class="font-semibold text-[15px]">${p.name}</div>
        <div class="flex items-center gap-2 text-sm">
          ${p.oldPrice ? `<span class="text-muted line-through text-xs">${p.oldPrice.toLocaleString()}</span>` : ""}
          <span class="text-brand font-bold">${p.price.toLocaleString()} تومان</span>
        </div>
        <button class="btn-brand mt-auto text-sm" data-add="${p.id}">افزودن به سبد</button>
      </div>
    </div>
  `;
};

// ---- اتصال eventها به کارت‌ها ----
function bindCardEvents(container, products) {
  container.querySelectorAll("[data-add]").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      const id = Number(btn.dataset.add);
      const product = products.find((p) => p.id === id);
      if (!product) return;

      // ⬇️ انیمیشن پرواز از موقعیت دکمه
      flyToCart(btn, product);

      // بعد از یه تأخیر کوچیک، محصول به سبد اضافه شه
      setTimeout(() => {
        addToCart(product);
        showToast("به سبد اضافه شد ✅");
      }, 350);
    });
  });

  container.querySelectorAll("[data-fav]").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", async () => {
      if (!user) {
        showToast("برای افزودن به علاقه‌مندی وارد شوید");
        setTimeout(() => (window.location.href = "login.html"), 800);
        return;
      }
      const id = Number(btn.dataset.fav);
      if (state.favorites.has(id)) {
        await removeFavorite(user.id, id);
        state.favorites.delete(id);
        btn.classList.remove("active");
        btn.textContent = "♡";
        showToast("از علاقه‌مندی‌ها حذف شد");
      } else {
        await addFavorite(user.id, id);
        state.favorites.add(id);
        btn.classList.add("active");
        btn.textContent = "♥";
        showToast("به علاقه‌مندی‌ها اضافه شد ❤");
      }
    });
  });
}

// ---- بارگذاری صفحه‌ی اول (ریست کامل) ----
async function loadFirstPage() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  // ریست state
  state.page = 1;
  state.products = [];
  state.hasMore = true;
  state.loading = false;

  // قطع observer قبلی
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // نمایش skeleton
  renderProductSkeletons(grid, PAGE_SIZE);

  try {
    const result = await fetchProducts({
      category: state.category,
      min: state.min,
      max: state.max,
      sort: state.sort,
      page: 1,
      q: state.q,
      limit: PAGE_SIZE,
    });

    if (!result.items.length) {
      grid.innerHTML =
        '<p class="text-muted text-center py-8">محصولی یافت نشد.</p>';
      return;
    }

    state.products = result.items;
    state.hasMore = result.hasMore;

    grid.innerHTML = result.items.map(cardHTML).join("");
    bindCardEvents(grid, state.products);

    // اگه بیشتر هست، sentinel بساز
    if (state.hasMore) {
      createSentinel();
      setupObserver();
    }
  } catch (err) {
    grid.innerHTML =
      '<p class="text-muted text-center py-8">خطا در دریافت محصولات.</p>';
  }
}

// ---- بارگذاری صفحه‌ی بعدی (افزودن) ----
async function loadNextPage() {
  if (state.loading || !state.hasMore) return;

  const grid = document.getElementById("productGrid");
  if (!grid) return;

  state.loading = true;
  showBottomLoader(true);

  try {
    const nextPage = state.page + 1;
    const result = await fetchProducts({
      category: state.category,
      min: state.min,
      max: state.max,
      sort: state.sort,
      page: nextPage,
      q: state.q,
      limit: PAGE_SIZE,
    });

    // اضافه کردن محصولات جدید به state
    state.products = [...state.products, ...result.items];
    state.page = nextPage;
    state.hasMore = result.hasMore;

    // ساخت HTML کارت‌های جدید
    const newCardsHTML = result.items.map(cardHTML).join("");

    // حذف sentinel قبلی
    const oldSentinel = document.getElementById("scrollSentinel");
    if (oldSentinel) oldSentinel.remove();

    // اضافه کردن کارت‌ها به grid
    grid.insertAdjacentHTML("beforeend", newCardsHTML);

    // اتصال eventها به کارت‌های جدید
    bindCardEvents(grid, state.products);

    // اگه هنوز بیشتر هست، sentinel جدید بساز
    if (state.hasMore) {
      createSentinel();
      setupObserver();
    }
  } catch (err) {
    showToast("خطا در بارگذاری محصولات بیشتر");
  } finally {
    state.loading = false;
    showBottomLoader(false);
  }
}

// ---- Sentinel: نقطه‌ای که وقتی بهش رسیدیم، لود می‌کنیم ----
function createSentinel() {
  // اگه از قبل هست، حذفش کن
  const old = document.getElementById("scrollSentinel");
  if (old) old.remove();

  const grid = document.getElementById("productGrid");
  grid.insertAdjacentHTML(
    "afterend",
    '<div id="scrollSentinel" style="height:1px;"></div>',
  );
}

// ---- IntersectionObserver ----
function setupObserver() {
  if (observer) observer.disconnect();

  const sentinel = document.getElementById("scrollSentinel");
  if (!sentinel) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadNextPage();
      }
    },
    {
      rootMargin: "200px", // ۲۰۰ پیکسل قبل از رسیدن به انتها لود کن
      threshold: 0,
    },
  );

  observer.observe(sentinel);
}

// ---- Loader پایین صفحه ----
function showBottomLoader(show) {
  let el = document.getElementById("bottomLoader");

  if (show) {
    if (!el) {
      el = document.createElement("div");
      el.id = "bottomLoader";
      el.className = "bottom-loader";
      el.innerHTML = '<div class="spinner"></div>';
      document
        .getElementById("productGrid")
        .insertAdjacentElement("afterend", el);
    }
    el.style.display = "flex";
  } else if (el) {
    el.style.display = "none";
  }
}

// ---- فیلترها ----
function setupCategoryFilters() {
  const filters = document.getElementById("filters");
  if (!filters) return;
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filters
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.category = btn.dataset.cat;
    loadFirstPage();
  });
  filters.querySelector(".filter-btn")?.classList.add("active");
}

function setupPriceFilter() {
  const apply = document.getElementById("applyFilter");
  const reset = document.getElementById("resetFilter");
  if (!apply) return;

  apply.addEventListener("click", () => {
    state.min = document.getElementById("minPrice").value;
    state.max = document.getElementById("maxPrice").value;
    state.sort = document.getElementById("sortBy").value;

    if (state.min && state.max && Number(state.min) > Number(state.max)) {
      showToast("حداقل قیمت نمی‌تواند بیشتر از حداکثر باشد");
      return;
    }
    loadFirstPage();
  });

  reset.addEventListener("click", () => {
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    document.getElementById("sortBy").value = "";
    state.min = state.max = state.sort = "";
    loadFirstPage();
  });
}

// ---- featured (صفحه‌ی اصلی) ----
async function loadFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  renderProductSkeletons(grid, 4);

  try {
    const result = await fetchProducts({ page: 1, limit: 4 });
    if (!result.items.length) {
      grid.innerHTML = "";
      return;
    }
    grid.innerHTML = result.items.map(cardHTML).join("");
    bindCardEvents(grid, result.items);
  } catch (err) {
    grid.innerHTML = "";
  }
}

// ---- بارگذاری علاقه‌مندی‌ها ----
async function loadFavorites() {
  if (!user) return;
  const favs = await getFavorites(user.id);
  state.favorites = new Set(favs.map((p) => p.id));
}

function setupSearch() {
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("searchClear");
  if (!input) return;

  let debounceTimer;
  input.addEventListener("input", () => {
    clearBtn.classList.toggle("hidden", !input.value);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.q = input.value.trim();
      loadFirstPage();
    }, 400);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    state.q = "";
    clearBtn.classList.add("hidden");
    loadFirstPage();
  });
}

// ---- شروع ----
document.addEventListener("DOMContentLoaded", async () => {
  await loadFavorites();
  await loadFeatured();
  setupCategoryFilters();
  setupPriceFilter();
  setupSearch();
  loadFirstPage();

  // ⬇️ نمایش recently (اگه وجود داشت)
  const recentlyEl = document.getElementById("recentlySection");
  if (recentlyEl) {
    renderRecentlyViewed(recentlyEl.querySelector("[data-recently-grid]"));
    const grid = recentlyEl.querySelector("[data-recently-grid]");
    if (grid && !grid.innerHTML.trim()) {
      recentlyEl.style.display = "none";
    }
  }
});
