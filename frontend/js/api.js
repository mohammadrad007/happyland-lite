// ⬇️ تشخیص خودکار محیط (لوکال یا Render)
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API = isLocal ? "http://localhost:4000/api" : "/api";

export async function fetchProducts({
  category = "all",
  q = "",
  min = "",
  max = "",
  sort = "",
  page = 1,
  limit = 8,
} = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (min) params.set("min", min);
  if (max) params.set("max", max);
  if (sort) params.set("sort", sort);
  params.set("page", page);
  params.set("limit", limit);

  const res = await fetch(`${API}/products?${params}`);
  return res.json(); // خروجی: { items, total, page, limit, hasMore }
}

export async function fetchProduct(id) {
  const res = await fetch(`${API}/products/${id}`);
  if (!res.ok) throw new Error("محصول یافت نشد");
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "خطا در ورود");
  return data;
}

export async function register(name, email, password) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "خطا در ثبت‌نام");
  return data;
}

export async function fetchOrders(userId) {
  const res = await fetch(`${API}/orders?userId=${userId}`);
  return res.json();
}

export async function createOrder(payload) {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function payOrder(orderId, success = true) {
  const res = await fetch(`${API}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, success }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "خطا در پرداخت");
  }
  return data;
}

// ---- Favorites ----
export async function getFavorites(userId) {
  const res = await fetch(`${API}/favorites?userId=${userId}`);
  return res.json();
}

export async function addFavorite(userId, productId) {
  const res = await fetch(`${API}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId }),
  });
  return res.json();
}

export async function removeFavorite(userId, productId) {
  const res = await fetch(`${API}/favorites/${productId}?userId=${userId}`, {
    method: "DELETE",
  });
  return res.json();
}

// ---- Deals ----
export async function fetchDeals() {
  const res = await fetch(`${API}/deals`);
  return res.json();
}

export async function fetchOrderById(orderId, userId) {
  const url = userId
    ? `${API}/orders/${orderId}?userId=${userId}`
    : `${API}/orders/${orderId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("سفارش یافت نشد");
  return res.json();
}

export async function validateCoupon(code, total) {
  const res = await fetch(`${API}/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, total }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "کد تخفیف معتبر نیست");
  return data;
}
