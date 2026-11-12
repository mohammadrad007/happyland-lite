import { payOrder } from "./api.js";

const order = JSON.parse(localStorage.getItem("hl_last_order") || "null");
if (!order) {
  window.location.href = "products.html";
  throw new Error("No order");
}

// ⬇️ پر کردن اطلاعات
document.getElementById("orderId").textContent = `#${order.id}`;
document.getElementById("orderTotal").textContent =
  order.total.toLocaleString() + " تومان";

if (order.shipping?.name) {
  document.getElementById("orderRecipient").textContent = order.shipping.name;
}

if (order.discount && order.discount > 0) {
  document.getElementById("subtotalRow").classList.remove("hidden");
  document.getElementById("orderSubtotal").textContent =
    order.subtotal.toLocaleString() + " تومان";

  document.getElementById("discountRow").classList.remove("hidden");
  document.getElementById("orderCoupon").textContent = order.couponCode || "";
  document.getElementById("orderDiscount").textContent =
    "- " + order.discount.toLocaleString() + " تومان";
}

// ⬇️ پرداخت
const payBtn = document.getElementById("payBtn");
const failBtn = document.getElementById("failBtn");
const cancelBtn = document.getElementById("cancelBtn");
const errorBox = document.getElementById("paymentError");

async function doPayment(success) {
  errorBox.classList.add("hidden");
  payBtn.disabled = true;
  failBtn.disabled = true;

  const originalText = payBtn.innerHTML;
  payBtn.innerHTML = `
    <span>در حال اتصال به درگاه...</span>
    <span class="payment-spinner"></span>
  `;

  try {
    const result = await payOrder(order.id, success);

    // ⬇️ ذخیره‌ی کد سفارش برای صفحه‌ی success
    localStorage.setItem("hl_success_order_id", order.id);
    localStorage.removeItem("hl_last_order");

    window.location.href = "success.html";
  } catch (err) {
    payBtn.innerHTML = originalText;
    payBtn.disabled = false;
    failBtn.disabled = false;

    errorBox.textContent = `❌ ${err.message || "خطا در پرداخت"}`;
    errorBox.classList.remove("hidden");
  }
}

payBtn.addEventListener("click", () => doPayment(true));
failBtn?.addEventListener("click", () => doPayment(false));

cancelBtn.addEventListener("click", () => {
  if (confirm("آیا از انصراف از پرداخت مطمئنید؟")) {
    window.location.href = "products.html";
  }
});
