import { fetchDeals } from "./api.js";
import { addToCart } from "./cart.js";
import { showToast, flyToCart } from "./ui.js";

const slider = document.getElementById("dealsSlider");
const btnPrev = document.getElementById("dealsPrev");
const btnNext = document.getElementById("dealsNext");

// ⚙️ تنظیمات autoplay
const AUTOPLAY_INTERVAL = 5000; // هر ۵ ثانیه
const RESUME_DELAY = 8000; // بعد از تعامل کاربر، ۸ ثانیه صبر کن

let autoplayTimer = null;
let resumeTimer = null;

const cardHTML = (p) => `
  <div class="deals-card">
    <a href="product.html?id=${p.id}">
      <div style="position:relative">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        <span class="badge-discount">${p.discount}٪</span>
      </div>
    </a>
    <div class="deals-card-body">
      <div class="deals-card-title">${p.name}</div>
      <div class="deals-card-price">
        <span class="old">${p.oldPrice.toLocaleString()}</span>
        <span class="new">${p.price.toLocaleString()}</span>
      </div>
      <button class="btn-brand text-xs mt-auto" data-add="${p.id}">افزودن به سبد</button>
    </div>
  </div>
`;

async function init() {
  if (!slider) return;

  const deals = await fetchDeals();

  if (!deals.length) {
    document.querySelector(".deals-section").style.display = "none";
    return;
  }

  slider.innerHTML = deals.map(cardHTML).join("");

  slider.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(btn.dataset.add);
      const product = deals.find((p) => p.id === id);
      if (product) {
        flyToCart(btn, product);
        setTimeout(() => {
          addToCart(product);
          showToast("به سبد اضافه شد ✅");
        }, 350);
      }
    });
  });

  setupArrows();
  startAutoplay();
}

/* ---- ناوبری اسلایدر ---- */
function setupArrows() {
  if (!btnPrev || !btnNext) return;

  const scrollAmount = () => slider.clientWidth * 0.8;

  btnPrev.addEventListener("click", () => {
    slider.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    pauseAutoplay();
  });
  btnNext.addEventListener("click", () => {
    slider.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    pauseAutoplay();
  });

  const updateArrows = () => {
    const atStart = Math.abs(slider.scrollLeft) < 5;
    const atEnd =
      Math.abs(slider.scrollLeft) + slider.clientWidth >=
      slider.scrollWidth - 5;
    btnPrev.disabled = atStart;
    btnNext.disabled = atEnd;
  };

  slider.addEventListener("scroll", updateArrows);
  window.addEventListener("resize", updateArrows);
  setTimeout(updateArrows, 100);

  // درگ با ماوس
  let isDown = false;
  let startX = 0;
  let startScroll = 0;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.style.cursor = "grabbing";
    startX = e.pageX;
    startScroll = slider.scrollLeft;
    pauseAutoplay();
  });
  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.style.cursor = "";
  });
  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.style.cursor = "";
  });
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const dx = e.pageX - startX;
    slider.scrollLeft = startScroll - dx;
  });

  // توقف autoplay وقتی کاربر با اسکرول/لمس تعامل داره
  slider.addEventListener("touchstart", pauseAutoplay, { passive: true });
  slider.addEventListener("wheel", pauseAutoplay, { passive: true });

  // توقف وقتی تب مخفی می‌شه
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });
}

/* ---- Autoplay ---- */
function startAutoplay() {
  stopAutoplay();
  if (!slider) return;
  autoplayTimer = setInterval(() => {
    const atEnd =
      Math.abs(slider.scrollLeft) + slider.clientWidth >=
      slider.scrollWidth - 5;
    if (atEnd) {
      // برگرد به اول
      slider.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      slider.scrollBy({ left: -slider.clientWidth * 0.8, behavior: "smooth" });
    }
  }, AUTOPLAY_INTERVAL);
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

function pauseAutoplay() {
  stopAutoplay();
  if (resumeTimer) clearTimeout(resumeTimer);
  resumeTimer = setTimeout(() => startAutoplay(), RESUME_DELAY);
}

document.addEventListener("DOMContentLoaded", init);
