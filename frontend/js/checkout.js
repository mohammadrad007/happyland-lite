import { getCart, getTotal, clearCart } from "./cart.js";
import { createOrder, validateCoupon } from "./api.js";
import { emptyCartHTML } from "./ui.js";

const cart = getCart();
const total = getTotal();

// ⬇️ حالت سبد خالی
if (!cart.length) {
  document.getElementById("checkoutLayout")?.classList.add("hidden");
  document.getElementById("checkoutSteps")?.classList.add("hidden");
  const emptyBox = document.getElementById("emptyCartBox");
  if (emptyBox) {
    emptyBox.innerHTML = emptyCartHTML();
    emptyBox.classList.remove("hidden");
  }
  // متوقف کردن بقیه‌ی کد
  throw new Error("Cart is empty");
}

let appliedCoupon = null;

/* ============================================ */
/* ===== رندر خلاصه‌ی سفارش ==================== */
/* ============================================ */

function renderSummary() {
  const itemsEl = document.getElementById("summaryItems");
  const countEl = document.getElementById("summaryCount");

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  if (countEl) countEl.textContent = `${totalItems} محصول در سبد شما`;

  itemsEl.innerHTML = cart
    .map((i) => {
      const itemTotal = i.price * i.qty;
      return `
        <div class="checkout-item">
          <img src="${i.image}" alt="${i.name}" />
          <div class="checkout-item-info">
            <div class="checkout-item-name">${i.name}</div>
            ${i.size ? `<div class="checkout-item-size">سایز: ${i.size}</div>` : ""}
            <div class="checkout-item-meta">${i.qty} × ${i.price.toLocaleString()}</div>
          </div>
          <div class="checkout-item-total">${itemTotal.toLocaleString()}</div>
        </div>
      `;
    })
    .join("");

  document.getElementById("summaryTotal").textContent =
    `${total.toLocaleString()} تومان`;
  document.getElementById("finalTotal").textContent =
    `${total.toLocaleString()} تومان`;

  if (appliedCoupon) updateTotalsWithDiscount();
}

function updateTotalsWithDiscount() {
  if (!appliedCoupon) return;

  const discountRow = document.getElementById("discountRow");
  discountRow.classList.remove("hidden");

  document.getElementById("discountCode").textContent = appliedCoupon.code;
  document.getElementById("discountAmount").textContent =
    `- ${appliedCoupon.discount.toLocaleString()} تومان`;
  document.getElementById("finalTotal").textContent =
    `${appliedCoupon.finalTotal.toLocaleString()} تومان`;
}

function clearDiscount() {
  appliedCoupon = null;
  document.getElementById("discountRow").classList.add("hidden");
  document.getElementById("couponInput").value = "";
  document.getElementById("couponMessage").textContent = "";
  document.getElementById("couponMessage").className = "coupon-message";
  document.getElementById("finalTotal").textContent =
    `${total.toLocaleString()} تومان`;
}

renderSummary();

/* ============================================ */
/* ===== کد تخفیف ============================= */
/* ============================================ */

const applyBtn = document.getElementById("couponApplyBtn");
const couponInput = document.getElementById("couponInput");
const couponMessage = document.getElementById("couponMessage");

applyBtn.addEventListener("click", async () => {
  const code = couponInput.value.trim();
  if (!code) {
    couponMessage.textContent = "لطفاً کد تخفیف را وارد کنید";
    couponMessage.className = "coupon-message error";
    return;
  }

  applyBtn.disabled = true;
  applyBtn.textContent = "...";
  couponMessage.textContent = "";
  couponMessage.className = "coupon-message";

  try {
    const result = await validateCoupon(code, total);
    appliedCoupon = result;

    couponMessage.textContent = `✅ ${result.description}`;
    couponMessage.className = "coupon-message success";

    updateTotalsWithDiscount();
  } catch (err) {
    clearDiscount();
    couponMessage.textContent = `❌ ${err.message}`;
    couponMessage.className = "coupon-message error";
  } finally {
    applyBtn.disabled = false;
    applyBtn.textContent = "اعمال";
  }
});

couponInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    applyBtn.click();
  }
});

/* ============================================ */
/* ===== ثبت سفارش ============================= */
/* ============================================ */

const form = document.getElementById("checkoutForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem("hl_user") || "null");
  const userId = user ? user.id : 1;

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !phone || !address) {
    alert("لطفاً همه‌ی فیلدها را پر کنید");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span>در حال ثبت سفارش...</span>
    <div class="checkout-spinner"></div>
  `;

  try {
    const finalTotal = appliedCoupon ? appliedCoupon.finalTotal : total;

    const order = await createOrder({
      userId,
      items: cart,
      subtotal: total,
      discount: appliedCoupon ? appliedCoupon.discount : 0,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      total: finalTotal,
      shipping: { name, phone, address },
    });

    localStorage.setItem("hl_last_order", JSON.stringify(order));
    clearCart();
    window.location.href = "payment.html";
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <span>ادامه و پرداخت</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    `;
    alert("خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.");
  }
});
