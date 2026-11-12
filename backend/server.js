require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;
const DATA_DIR = path.join(__dirname, "data");
const FAKE_DELAY_TIME = 40;

const PAYMENT_CONFIG = {
  mode: process.env.PAYMENT_MODE || "manual",
  delay: Number(process.env.PAYMENT_DELAY) || 0,
  successMessage:
    process.env.PAYMENT_SUCCESS_MESSAGE || "پرداخت با موفقیت انجام شد",
  failMessage: process.env.PAYMENT_FAIL_MESSAGE || "پرداخت ناموفق بود",
};

app.use(cors());
app.use(express.json());

const readJSON = (file) =>
  JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
const writeJSON = (file, data) =>
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));

// ---------- Products ----------
app.get("/api/products", async (req, res) => {
  await new Promise((r) => setTimeout(r, FAKE_DELAY_TIME));
  const { category, q, min, max, sort, page, limit } = req.query;
  let products = readJSON("products.json");

  // فیلترها
  if (category && category !== "all") {
    products = products.filter((p) => p.category === category);
  }
  if (q) {
    const term = q.toLowerCase().trim();
    products = products.filter((p) => p.name.toLowerCase().includes(term));
  }
  if (min) products = products.filter((p) => p.price >= Number(min));
  if (max) products = products.filter((p) => p.price <= Number(max));

  // مرتب‌سازی
  if (sort === "price-asc") products.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") products.sort((a, b) => b.price - a.price);
  else if (sort === "discount") {
    products.sort((a, b) => {
      const da = a.oldPrice ? 1 - a.price / a.oldPrice : 0;
      const db = b.oldPrice ? 1 - b.price / b.oldPrice : 0;
      return db - da;
    });
  }

  // ⬇️ Pagination
  const total = products.length;
  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || 8);
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const items = products.slice(start, end);

  res.json({
    items,
    total,
    page: pageNum,
    limit: pageSize,
    hasMore: end < total,
  });
});

app.get("/api/products/:id", (req, res) => {
  const products = readJSON("products.json");
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "محصول یافت نشد" });
  res.json(product);
});

// ---------- Deals (پیشنهادات ویژه) ----------
app.get("/api/deals", (req, res) => {
  const products = readJSON("products.json");
  const deals = products
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .map((p) => ({
      ...p,
      discount: Math.round((1 - p.price / p.oldPrice) * 100),
    }))
    .filter((p) => p.discount > 50) // ⬅️ این خط اضافه شد
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 10);
  res.json(deals);
});

// ---------- Auth ----------
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const users = readJSON("users.json");
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "ایمیل یا رمز اشتباه است" });
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: "demo-token-" + user.id });
});

app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "همه‌ی فیلدها الزامی هستند" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "رمز عبور باید حداقل ۶ کاراکتر باشد" });
  }
  const users = readJSON("users.json");
  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ error: "این ایمیل قبلاً ثبت شده است" });
  }
  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);
  writeJSON("users.json", users);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token: "demo-token-" + newUser.id });
});

// ---------- Favorites ----------
app.get("/api/favorites", (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.json([]);
  const favorites = readJSON("favorites.json");
  const userFavs = favorites.filter((f) => f.userId === Number(userId));
  const products = readJSON("products.json");
  const favProducts = userFavs
    .map((f) => products.find((p) => p.id === f.productId))
    .filter(Boolean);
  res.json(favProducts);
});

app.post("/api/favorites", (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: "userId و productId الزامی هستند" });
  }
  const favorites = readJSON("favorites.json");
  const exists = favorites.find(
    (f) => f.userId === Number(userId) && f.productId === Number(productId),
  );
  if (exists) return res.json({ added: false });
  favorites.push({ userId: Number(userId), productId: Number(productId) });
  writeJSON("favorites.json", favorites);
  res.status(201).json({ added: true });
});

app.delete("/api/favorites/:productId", (req, res) => {
  const { userId } = req.query;
  const productId = Number(req.params.productId);
  if (!userId) return res.status(400).json({ error: "userId الزامی است" });
  let favorites = readJSON("favorites.json");
  favorites = favorites.filter(
    (f) => !(f.userId === Number(userId) && f.productId === productId),
  );
  writeJSON("favorites.json", favorites);
  res.json({ removed: true });
});

// ---------- Orders ----------
app.get("/api/orders", (req, res) => {
  const { userId } = req.query;
  let orders = readJSON("orders.json");
  if (userId) orders = orders.filter((o) => o.userId === Number(userId));
  res.json(orders);
});

app.get("/api/orders/:id", (req, res) => {
  const { userId } = req.query;
  const orders = readJSON("orders.json");
  const order = orders.find((o) => o.id === Number(req.params.id));

  if (!order) return res.status(404).json({ error: "سفارش یافت نشد" });

  // امنیت ساده: فقط صاحب سفارش بتونه ببینه
  if (userId && order.userId !== Number(userId)) {
    return res.status(403).json({ error: "دسترسی غیرمجاز" });
  }

  res.json(order);
});

app.post("/api/orders", (req, res) => {
  const orders = readJSON("orders.json");
  const newOrder = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    status: "در انتظار پرداخت",
    ...req.body,
  };
  orders.push(newOrder);
  writeJSON("orders.json", orders);
  res.status(201).json(newOrder);
});

// ---------- Payment (Mock with .env config) ----------
app.post("/api/payment", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "شناسه سفارش الزامی است" });
  }

  const orders = readJSON("orders.json");
  const order = orders.find((o) => o.id === Number(orderId));

  if (!order) {
    return res.status(404).json({ error: "سفارش یافت نشد" });
  }

  // ⬇️ شبیه‌سازی تاخیر درگاه
  if (PAYMENT_CONFIG.delay > 0) {
    await new Promise((r) => setTimeout(r, PAYMENT_CONFIG.delay));
  }

  // ⬇️ تصمیم بر اساس .env
  let isSuccess = true;

  switch (PAYMENT_CONFIG.mode) {
    case "always-fail":
      isSuccess = false;
      break;

    case "random":
      // ۸۰٪ موفق
      isSuccess = Math.random() < 0.8;
      break;

    case "always-success":
      isSuccess = true;
      break;

    case "manual":
    default:
      // کاربر خودش از فرانت موفق/ناموفق رو انتخاب می‌کنه
      isSuccess = req.body.success !== false; // پیش‌فرض موفق
      break;
  }

  if (!isSuccess) {
    return res.status(402).json({
      error: PAYMENT_CONFIG.failMessage,
      success: false,
    });
  }

  // ⬇️ پرداخت موفق
  order.status = "پرداخت شده";
  order.paidAt = new Date().toISOString();
  writeJSON("orders.json", orders);

  res.json({
    success: true,
    message: PAYMENT_CONFIG.successMessage,
    order,
  });
});

// ---------- Coupons ----------
app.post("/api/coupons/validate", (req, res) => {
  const { code, total } = req.body;

  if (!code || !total) {
    return res.status(400).json({ error: "کد تخفیف و مبلغ سبد الزامی است" });
  }

  const coupons = readJSON("coupons.json");
  const coupon = coupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase(),
  );

  if (!coupon) {
    return res.status(404).json({ error: "کد تخفیف معتبر نیست" });
  }

  if (total < coupon.minTotal) {
    return res.status(400).json({
      error: `حداقل مبلغ سبد برای این کد ${coupon.minTotal.toLocaleString()} تومان است`,
    });
  }

  // محاسبه‌ی تخفیف
  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round((total * coupon.value) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }

  // تخفیف نباید بیشتر از مبلغ کل باشه
  if (discount > total) discount = total;

  res.json({
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    description: coupon.description,
    discount,
    finalTotal: total - discount,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend: http://localhost:${PORT}`);
});
