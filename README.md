# 🎈 Happy Land Lite

A minimalist online clothing store — university project built with pure HTML/CSS/JS, local Tailwind CSS, and a Node.js/Express backend.

## ✨ Features

- **Products:** live search, category filter, price range filter, sorting, infinite scroll
- **Product page:** size & quantity selection, shipping info, features
- **Shopping cart:** add/remove, quantity control, size support (unique cartId)
- **Coupons:** percentage/fixed discounts with min purchase and max cap
- **Favorites:** per-user wishlist
- **Authentication:** register (with password strength meter), login, interactive avatar dropdown
- **Checkout:** modern 3-step layout with order summary and coupon
- **Payment:** simulated gateway with `.env`-based config (success/fail/random/manual)
- **Orders:** dashboard, detail page, animated payment success page
- **Recently viewed:** stored in localStorage
- **Dark/Light theme:** with localStorage and prefers-color-scheme
- **UX:** Skeleton Loader, fly-to-cart animation, Toast notifications, Breadcrumb, empty cart animation
- **Fully responsive** + interactive Leaflet map on the contact page

## 🚀 Install & Run

```bash
npm run install:all     # install all packages (root + backend)
npm run tw:build        # build Tailwind CSS
npm start               # run backend + frontend together
```

- Frontend: http://localhost:5500
- Backend: http://localhost:4000/api/products

### Development mode

Open two terminals:

```bash
npm run tw:watch        # Terminal 1 — auto-rebuild Tailwind
npm run dev             # Terminal 2 — run backend + frontend
```

## 🔐 Demo Login

- Email: `demo@demo.com`
- Password: `123456`

## 🗂 Structure

```
frontend/
├── *.html              → 13 pages (index, products, product, about, contact, login, register,
│                          favorites, dashboard, order, checkout, payment, success)
├── assets/             → product images (1.jpg to 20.jpg)
├── css/                → base, layout, components, utilities, tailwind
└── js/                 → modules: api, cart, ui, header, footer, theme, breadcrumb,
                          recently, product, products, deals, auth, favorites, dashboard,
                          checkout, order, payment, success
backend/
├── .env                → payment config (not committed)
├── .env.example        → sample env (committed)
├── server.js           → Express + 14 endpoints
└── data/               → products.json, users.json, orders.json, favorites.json, coupons.json
```

## ⚙️ Environment Variables

Create `backend/.env` (or copy from `backend/.env.example`):

```env
PAYMENT_MODE=manual          # always-success | always-fail | random | manual
PAYMENT_DELAY=2000           # ms — simulated gateway delay
PAYMENT_SUCCESS_MESSAGE=پرداخت با موفقیت انجام شد
PAYMENT_FAIL_MESSAGE=پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.
```

| Mode             | Behavior                                   |
| ---------------- | ------------------------------------------ |
| `always-success` | Every payment succeeds                     |
| `always-fail`    | Every payment fails (for testing error UX) |
| `random`         | 80% success, 20% fail                      |
| `manual`         | User picks success/fail (default for demo) |

> ⚠️ Add `backend/.env` to `.gitignore`. Keep `.env.example` committed.

## 🔌 API Endpoints

| Method | Path                    | Description                               |
| ------ | ----------------------- | ----------------------------------------- |
| GET    | `/api/products`         | Product list (filter, search, pagination) |
| GET    | `/api/products/:id`     | Product details                           |
| GET    | `/api/deals`            | Special deals (discounts above 50%)       |
| POST   | `/api/login`            | Login                                     |
| POST   | `/api/register`         | Register                                  |
| GET    | `/api/favorites`        | List favorites                            |
| POST   | `/api/favorites`        | Add to favorites                          |
| DELETE | `/api/favorites/:id`    | Remove from favorites                     |
| POST   | `/api/coupons/validate` | Validate coupon                           |
| GET    | `/api/orders`           | List orders                               |
| GET    | `/api/orders/:id`       | Order details                             |
| POST   | `/api/orders`           | Create order                              |
| POST   | `/api/payment`          | Payment (config from `.env`)              |
| GET    | `/api/config/payment`   | Read payment config (optional)            |

## 🎟 Sample Coupons

| Code        | Discount          | Min Purchase |
| ----------- | ----------------- | ------------ |
| `HAPPY20`   | 20% (max 500,000) | 500,000      |
| `WELCOME10` | 10% (max 200,000) | —            |
| `SAVE100K`  | 100,000 Toman     | 800,000      |
| `FREESHIP`  | 50,000 Toman      | —            |

## 🎨 Tailwind

Tailwind is installed **locally** (not via CDN). After any change in HTML/JS, run `npm run tw:build` or keep `tw:watch` running.

## ⚠️ Limitations

- No real database — data stored in JSON files
- Passwords stored in plain text — bcrypt needed for production
- Auth token is a demo token, no real JWT
- Payment gateway is simulated (config-driven via `.env`)
- Contact form is simulated (no real email sending)
- No automated tests (unit/integration)

## 🧪 Quick Test

| Test           | Path                                                     |
| -------------- | -------------------------------------------------------- |
| Search         | `products.html` → type in the search bar                 |
| Price filter   | `products.html` → filter panel                           |
| Size selection | `product.html?id=3` → pick size + quantity               |
| Register       | `register.html` (try weak/strong passwords)              |
| Favorites      | Login → click heart on a product → `favorites.html`      |
| Coupon         | `checkout.html` → `HAPPY20`                              |
| Full purchase  | Cart → `checkout.html` → `payment.html` → `success.html` |
| Payment fail   | `payment.html` → click "پرداخت ناموفق (تست)"             |
| Order detail   | `dashboard.html` → click any order row                   |
| Dark mode      | Click 🌙 in header → persists across pages               |
| Map            | `contact.html`                                           |

## 🐛 Troubleshooting

| Issue                            | Solution                                                        |
| -------------------------------- | --------------------------------------------------------------- |
| `tailwindcss: command not found` | `npm install`                                                   |
| Page has no styles               | `npm run tw:build`                                              |
| New Tailwind class not working   | Run `tw:watch`                                                  |
| Images not loading               | Ensure `frontend/assets/` contains `1.jpg` to `20.jpg`          |
| Map not loading                  | Check connection to `unpkg.com` (Leaflet)                       |
| CORS error                       | Backend on 4000, frontend on 5500                               |
| Payment mode not applied         | Check `backend/.env` and restart backend                        |
| `.env` not loaded                | Make sure `require('dotenv').config()` is at top of `server.js` |

## 🧱 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES Modules), Tailwind CSS 3, Leaflet
- **Backend:** Node.js, Express, CORS, dotenv
- **Storage:** JSON Files
- **Font:** Vazirmatn
- **Tools:** lite-server, concurrently, tailwindcss CLI

## 📝 Notes

- Built for a **university demo** — no real database
- Code is **modular** — each JS file has a single responsibility
- Cart uses `cartId` (combination of `id-size`) — supports multiple sizes
- Payment behavior is configurable via `.env` — no code changes needed
- Tailwind is built locally — works offline
- Theme preference and cart persist in `localStorage`

---

University Project — Built with ❤
