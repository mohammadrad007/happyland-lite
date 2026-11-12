/**
 * ساخت breadcrumb به‌صورت داینامیک
 * @param {Array} items - آرایه‌ای از { label, href }
 *   - آخرین آیتم (بدون href) عنوان صفحه‌ی فعلیه
 *
 * مثال:
 * renderBreadcrumb([
 *   { label: 'خانه', href: 'index.html' },
 *   { label: 'محصولات', href: 'products.html' },
 *   { label: 'هودی زنانه' }, // آخرین آیتم لینک نداره
 * ]);
 */
export function renderBreadcrumb(items) {
  const container = document.getElementById("breadcrumb");
  if (!container) return;

  if (!items || !items.length) {
    container.style.display = "none";
    return;
  }

  container.style.display = "";

  const homeIcon = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `;

  const sepIcon = `
    <svg class="bc-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  `;

  container.innerHTML = items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      const isFirst = index === 0;

      const icon = isFirst ? homeIcon : "";
      const label = `<span class="bc-label">${item.label}</span>`;

      if (isLast || !item.href) {
        return `<span class="bc-item bc-current">${icon}${label}</span>`;
      }

      return `
        <a href="${item.href}" class="bc-item bc-link">${icon}${label}</a>
        ${sepIcon}
      `;
    })
    .join("");
}

/**
 * نسخه‌ی ساده برای صفحات ثابت
 * @param {string} title - عنوان صفحه
 * @param {string} parentLabel - (اختیاری) عنوان والد
 * @param {string} parentHref - (اختیاری) لینک والد
 */
export function renderSimpleBreadcrumb(title, parentLabel, parentHref) {
  const items = [{ label: "خانه", href: "index.html" }];

  if (parentLabel && parentHref) {
    items.push({ label: parentLabel, href: parentHref });
  }

  items.push({ label: title });
  renderBreadcrumb(items);
}
