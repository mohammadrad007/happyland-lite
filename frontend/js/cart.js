const KEY = "hl_cart";

export function getCart() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart:change"));
}

export function addToCart(product, qty = 1, size = null) {
  const cart = getCart();
  const cartId = size ? `${product.id}-${size}` : `${product.id}`;

  const existing = cart.find((i) => i.cartId === cartId);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      cartId,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size || null,
      qty,
    });
  }
  saveCart(cart);
}

export function updateQty(cartId, delta) {
  const cart = getCart();
  // ⬇️ مقایسه با String برای اطمینان
  const item = cart.find((i) => String(i.cartId) === String(cartId));
  if (!item) return;

  const newQty = item.qty + delta;

  if (newQty <= 0) {
    removeFromCart(cartId);
    return;
  }

  item.qty = newQty;
  saveCart(cart);
}

export function removeFromCart(cartId) {
  // ⬇️ مقایسه با String و پشتیبانی از محصولات قدیمی (بدون cartId)
  const cart = getCart().filter((i) => {
    const itemCartId = i.cartId || String(i.id);
    return String(itemCartId) !== String(cartId);
  });
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function getTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function getCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}
