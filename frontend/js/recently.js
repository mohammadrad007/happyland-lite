const KEY = "hl_recently";
const MAX_ITEMS = 8;

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToRecentlyViewed(product) {
  if (!product || !product.id) return;

  const list = getRecentlyViewed();

  // اگه قبلاً بود، حذفش کن (که بره اول لیست)
  const filtered = list.filter((p) => p.id !== product.id);

  // محصول جدید رو اول بذار
  filtered.unshift({
    id: product.id,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    image: product.image,
  });

  // فقط ۸ تای آخر
  const trimmed = filtered.slice(0, MAX_ITEMS);

  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function clearRecentlyViewed() {
  localStorage.removeItem(KEY);
}
