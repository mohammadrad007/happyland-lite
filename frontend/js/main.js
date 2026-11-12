import { renderCart, setupCartToggle, updateAuthLink } from "./ui.js";
import { renderHeader } from "./header.js";
import { initTheme } from "./theme.js";

// ⬇️ تشخیص صفحاتی که نباید سبد/ورود داشته باشن
const path = window.location.pathname.split("/").pop() || "index.html";
const minimalHeaderPages = ["about.html", "contact.html"];
const isMinimal = minimalHeaderPages.includes(path);

// ⬇️ رندر هدر با تنظیمات مناسب
renderHeader({
  showCart: !isMinimal,
  showAuth: !isMinimal,
});

initTheme();

document.addEventListener("DOMContentLoaded", () => {
  // ⬇️ فقط اگه سبد وجود داشت، setup کن
  if (document.getElementById("cartBtn")) {
    setupCartToggle();
  }
  updateAuthLink();
  renderCart();
});

window.addEventListener("cart:change", renderCart);
window.addEventListener("storage", renderCart);
