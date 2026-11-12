import { fetchOrderById, payOrder } from "./api.js";
import { showToast } from "./ui.js";

const user = JSON.parse(localStorage.getItem("hl_user") || "null");
if (!user) window.location.href = "login.html";

const orderId = new URLSearchParams(location.search).get("id");
const content = document.getElementById("orderContent");

if (!orderId) {
  content.innerHTML =
    '<p class="text-center text-muted py-10">شناسه سفارش نامعتبر است.</p>';
}

async function loadOrder() {
  try {
    const order = await fetchOrderById(orderId, user.id);

    const isPaid = order.status === "پرداخت شده";
    const date = new Date(order.createdAt).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const itemsHTML = order.items
      .map(
        (item) => `
        <div class="order-item">
          <img src="${item.image || "/assets/" + item.id + ".jpg"}" alt="${item.name}" />
          <div class="order-item-info">
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-meta">
              ${item.qty} × ${item.price.toLocaleString()} تومان
            </div>
          </div>
          <div class="order-item-total">
            ${(item.price * item.qty).toLocaleString()}
          </div>
        </div>
      `,
      )
      .join("");

    const shipping = order.shipping || {};

    content.innerHTML = `
      <!-- هدر سفارش -->
      <div class="order-header">
        <div>
          <h1 class="order-title">سفارش #${order.id}</h1>
          <p class="order-date">ثبت شده در ${date}</p>
        </div>
        <span class="status-badge ${isPaid ? "paid" : "pending"}">${order.status}</span>
      </div>

      <!-- خلاصه -->
      <div class="order-stats">
        <div class="order-stat">
          <div class="order-stat-label">تعداد اقلام</div>
          <div class="order-stat-value">${order.items.reduce((s, i) => s + i.qty, 0)}</div>
        </div>
        <div class="order-stat">
          <div class="order-stat-label">مبلغ کل</div>
          <div class="order-stat-value text-brand">${order.total.toLocaleString()} تومان</div>
        </div>
        <div class="order-stat">
          <div class="order-stat-label">وضعیت</div>
          <div class="order-stat-value">${order.status}</div>
        </div>
      </div>
  ${
    order.discount > 0
      ? `
    <div class="order-section">
      <h2 class="order-section-title">تخفیف اعمال‌شده</h2>
      <div class="order-shipping">
        <div class="order-shipping-row">
          <span class="order-shipping-label">کد تخفیف:</span>
          <span class="text-green-600 font-bold">${order.couponCode}</span>
        </div>
        <div class="order-shipping-row">
          <span class="order-shipping-label">مبلغ تخفیف:</span>
          <span class="text-green-600">- ${order.discount.toLocaleString()} تومان</span>
        </div>
        <div class="order-shipping-row">
          <span class="order-shipping-label">جمع سبد:</span>
          <span>${order.subtotal.toLocaleString()} تومان</span>
        </div>
      </div>
    </div>
  `
      : ""
  }
      <!-- اقلام -->
      <div class="order-section">
        <h2 class="order-section-title">اقلام سفارش</h2>
        <div class="order-items">
          ${itemsHTML}
        </div>
      </div>


      <!-- آدرس ارسال -->
      ${
        shipping.name
          ? `
        <div class="order-section">
          <h2 class="order-section-title">اطلاعات ارسال</h2>
          <div class="order-shipping">
            <div class="order-shipping-row">
              <span class="order-shipping-label">نام گیرنده:</span>
              <span>${shipping.name}</span>
            </div>
            <div class="order-shipping-row">
              <span class="order-shipping-label">شماره تماس:</span>
              <span dir="ltr">${shipping.phone}</span>
            </div>
            <div class="order-shipping-row">
              <span class="order-shipping-label">آدرس:</span>
              <span>${shipping.address}</span>
            </div>
          </div>
        </div>
      `
          : ""
      }

      <!-- دکمه پرداخت -->
      ${
        !isPaid
          ? `
        <div class="order-actions">
          <button id="payBtn" class="btn-brand">پرداخت سفارش</button>
          <p class="text-muted text-xs mt-2">این سفارش هنوز پرداخت نشده است.</p>
        </div>
      `
          : ""
      }
    `;

    // listener دکمه‌ی پرداخت
    const payBtn = document.getElementById("payBtn");
    if (payBtn) {
      payBtn.addEventListener("click", async () => {
        payBtn.disabled = true;
        payBtn.textContent = "در حال پرداخت...";
        try {
          await payOrder(order.id);
          showToast("پرداخت با موفقیت انجام شد ✅");
          setTimeout(() => location.reload(), 800);
        } catch (err) {
          showToast("خطا در پرداخت");
          payBtn.disabled = false;
          payBtn.textContent = "پرداخت سفارش";
        }
      });
    }
  } catch (err) {
    content.innerHTML = `<p class="text-center text-muted py-10">${err.message}</p>`;
  }
}

loadOrder();
