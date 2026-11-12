import { getFavorites, removeFavorite } from "./api.js";
import { addToCart } from "./cart.js";
import { showToast, flyToCart } from "./ui.js";
import { renderSimpleBreadcrumb } from "./breadcrumb.js";

const user = JSON.parse(localStorage.getItem("hl_user") || "null");
if (!user) {
  window.location.href = "login.html";
}

const grid = document.getElementById("favGrid");
const emptyState = document.getElementById("emptyState");
renderSimpleBreadcrumb("علاقه‌مندی‌ها");
const cardHTML = (p) => `
  <div class="product-card relative">
    <button class="fav-btn active" data-remove="${p.id}" title="حذف از علاقه‌مندی‌ها">♥</button>
    <a href="product.html?id=${p.id}">
      <img src="${p.image}" alt="${p.name}" />
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

async function render() {
  const products = await getFavorites(user.id);

  if (!products.length) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");
  grid.innerHTML = products.map(cardHTML).join("");

  const favCount = document.getElementById("favCount");
  const addAllBtn = document.getElementById("addAllBtn");

  // بعد از دریافت products
  if (products.length) {
    favCount.textContent = `${products.length} محصول در علاقه‌مندی‌ها`;
    addAllBtn.classList.remove("hidden");
    favCount.classList.remove("hidden");
  } else {
    favCount.textContent = "";
    addAllBtn.classList.add("hidden");
  }

  // دکمه‌ی افزودن همه
  addAllBtn.onclick = () => {
    products.forEach((p) => addToCart(p));
    showToast(`${products.length} محصول به سبد اضافه شد ✅`);
  };
  grid.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const card = btn.closest(".product-card");
      card.classList.add("removing");

      setTimeout(async () => {
        await removeFavorite(user.id, Number(btn.dataset.remove));
        showToast("از علاقه‌مندی‌ها حذف شد");
        render();
      }, 300);
    });
  });

  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.add);
      const product = products.find((p) => p.id === id);
      if (product) {
        flyToCart(btn, product);
        setTimeout(() => {
          addToCart(product);
          showToast("به سبد اضافه شد ✅");
        }, 350);
      }
    });
  });
}

render();
