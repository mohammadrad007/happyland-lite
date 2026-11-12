const STORAGE_KEY = "hl_theme";

export function initTheme() {
  // ۱) اگه کاربر قبلاً انتخاب کرده، همون رو اعمال کن
  const saved = localStorage.getItem(STORAGE_KEY);

  // ۲) اگه انتخاب نکرده، از تنظیمات سیستم پیروی کن
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = saved || (systemDark ? "dark" : "light");
  applyTheme(theme);
  setupToggle();

  // ۳) اگه کاربر انتخاب نکرده، تغییرات سیستم رو دنبال کن
  if (!saved) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? "dark" : "light");
        }
      });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  updateToggleIcon(theme);
}

function updateToggleIcon(theme) {
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function setupToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });
}
