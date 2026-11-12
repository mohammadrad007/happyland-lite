import { fetchOrderById } from "./api.js";
import { showToast } from "./ui.js";

const user = JSON.parse(localStorage.getItem("hl_user") || "null");
const orderId = localStorage.getItem("hl_success_order_id");

const container = document.getElementById("successContent");

// اگه کد سفارش نیست، برگرد به خانه
if (!orderId) {
  window.location.href = "index.html";
}

async function loadSuccess() {
  try {
    const order = await fetchOrderById(orderId, user ? user.id : null);

    const date = new Date(order.createdAt).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const itemsHTML = (order.items || [])
      .map(
        (item) => `
        <div class="success-item">
          <img src="${item.image || "/assets/" + item.id + ".jpg"}" alt="${item.name}" />
          <div class="success-item-info">
            <div class="success-item-name">${item.name}</div>
            <div class="success-item-meta">${item.qty} × ${item.price.toLocaleString()} تومان</div>
          </div>
          <div class="success-item-total">${(item.price * item.qty).toLocaleString()}</div>
        </div>
      `,
      )
      .join("");

    container.innerHTML = `
      <!-- انیمیشن تیک -->
      <div class="success-checkmark">
        <svg viewBox="0 0 52 52" class="checkmark-svg">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
          <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>

      <!-- عنوان -->
      <h1 class="success-title">پرداخت با موفقیت انجام شد!</h1>
      <p class="success-subtitle">سفارش شما با موفقیت ثبت شد و در حال پردازش است.</p>

      <!-- جزئیات سفارش -->
      <div class="success-details">
        <div class="success-row">
          <span class="success-label">کد سفارش</span>
          <span class="success-value font-bold">#${order.id}</span>
        </div>
        <div class="success-row">
          <span class="success-label">تاریخ</span>
          <span class="success-value">${date}</span>
        </div>
        <div class="success-row">
          <span class="success-label">مبلغ پرداختی</span>
          <span class="success-value text-brand font-bold">${order.total.toLocaleString()} تومان</span>
        </div>
        ${
          order.discount > 0
            ? `
          <div class="success-row">
            <span class="success-label">تخفیف (${order.couponCode})</span>
            <span class="success-value" style="color:#27ae60">- ${order.discount.toLocaleString()} تومان</span>
          </div>
        `
            : ""
        }
      </div>

      <!-- اقلام -->
      <div class="success-items-section">
        <h2 class="success-items-title">اقلام سفارش</h2>
        <div class="success-items">
          ${itemsHTML}
        </div>
      </div>

      <!-- دکمه‌ها -->
      <div class="success-actions">
        <a href="dashboard.html" class="btn-brand success-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          مشاهده در داشبورد
        </a>
        <a href="products.html" class="btn-outline success-btn">
          ادامه خرید
        </a>
      </div>

      <!-- لینک جزئیات سفارش -->
      <a href="order.html?id=${order.id}" class="success-order-link">
        مشاهده‌ی جزئیات کامل سفارش →
      </a>
    `;

    // پاک کردن کد سفارش از localStorage بعد از لود موفق
    setTimeout(() => {
      localStorage.removeItem("hl_success_order_id");
    }, 1000);
  } catch (err) {
    container.innerHTML = `
      <div class="text-center py-10">
        <p class="text-muted mb-4">خطا در دریافت اطلاعات سفارش.</p>
        <a href="dashboard.html" class="btn-brand">رفتن به داشبورد</a>
      </div>
    `;
    showToast("خطا در بارگذاری");
  }
}

loadSuccess();
