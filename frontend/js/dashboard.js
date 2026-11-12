import { fetchOrders } from "./api.js";
import { renderTableSkeletons } from "./ui.js";

const user = JSON.parse(localStorage.getItem("hl_user") || "null");
if (!user) window.location.href = "login.html";

// ⬇️ اگه userName و logoutBtn هنوز توی dashboard.html هستن، نمایش بده
const userNameEl = document.getElementById("userName");
if (userNameEl) userNameEl.textContent = user.name;

// دکمه‌ی خروج قدیمی (اگه هست)
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("hl_user");
    localStorage.removeItem("hl_token");
    window.location.href = "index.html";
  });
}

async function loadOrders() {
  const tbody = document.getElementById("ordersBody");
  if (!tbody) return;

  renderTableSkeletons(tbody, 3);

  try {
    const orders = await fetchOrders(user.id);

    document.getElementById("statOrders").textContent = orders.length;
    document.getElementById("statPaid").textContent = orders.filter(
      (o) => o.status === "پرداخت شده",
    ).length;
    document.getElementById("statPending").textContent = orders.filter(
      (o) => o.status !== "پرداخت شده",
    ).length;

    if (!orders.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="p-4 text-center text-muted">سفارشی یافت نشد.</td></tr>';
      return;
    }

    tbody.innerHTML = orders
      .map((o) => {
        const isPaid = o.status === "پرداخت شده";
        const date = new Date(o.createdAt).toLocaleDateString("fa-IR");
        const itemsCount = o.items?.reduce((s, i) => s + i.qty, 0) || 0;
        return `
          <tr class="border-t border-base order-row" data-id="${o.id}" style="cursor:pointer">
            <td class="p-3">${o.id}</td>
            <td class="p-3">${date}</td>
            <td class="p-3">${itemsCount}</td>
            <td class="p-3">${(o.total || 0).toLocaleString()} تومان</td>
            <td class="p-3">
              <span class="status-badge ${isPaid ? "paid" : "pending"}">${o.status}</span>
            </td>
          </tr>`;
      })
      .join("");

    tbody.querySelectorAll(".order-row").forEach((row) => {
      row.addEventListener("click", () => {
        window.location.href = `order.html?id=${row.dataset.id}`;
      });
    });
  } catch (err) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="p-4 text-center text-muted">خطا در دریافت سفارش‌ها.</td></tr>';
  }
}

loadOrders();
