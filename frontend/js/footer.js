// فوتر مشترک — توی همه‌ی صفحه‌ها import می‌شه
export function renderFooter() {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-grid">

        <!-- ستون ۱: راهنمای خرید -->
        <div class="footer-col">
          <h3 class="footer-heading">راهنمای خرید</h3>
          <ul class="footer-links">
            <li><a href="#">پرسش‌های متداول</a></li>
            <li><a href="#">شرایط بازگشت</a></li>
            <li><a href="#">نحوه ثبت سفارش</a></li>
            <li><a href="#">قوانین و مقررات</a></li>
          </ul>
        </div>

        <!-- ستون ۲: خدمات مشتریان -->
        <div class="footer-col">
          <h3 class="footer-heading">خدمات مشتریان</h3>
          <ul class="footer-links">
            <li><a href="about.html">درباره ما</a></li>
            <li><a href="contact.html">تماس با ما</a></li>
            <li><a href="#">شعبه‌های هپی لند</a></li>
            <li><a href="#">فرصت‌های شغلی</a></li>
          </ul>
        </div>

        <!-- ستون ۳: دسترسی سریع -->
        <div class="footer-col">
          <h3 class="footer-heading">دسترسی سریع</h3>
          <ul class="footer-links">
            <li><a href="products.html">همه محصولات</a></li>
            <li><a href="favorites.html">علاقه‌مندی‌ها</a></li>
            <li><a href="dashboard.html">داشبورد سفارش‌ها</a></li>
            <li><a href="checkout.html">سبد خرید</a></li>
          </ul>
        </div>

        <!-- ستون ۴: تماس با ما -->
        <div class="footer-col footer-contact">
          <h3 class="footer-heading">تماس با ما</h3>
          <ul class="footer-info">
            <li>
              <span class="footer-icon">📞</span>
              <span>۰۱۳-۴۴۹۹۱۲۰۰<br>۰۹۰۵۵۳۵۹۶۶۸</span>
            </li>
            <li>
              <span class="footer-icon">🕐</span>
              <span>شنبه تا چهارشنبه: ۷ تا ۱۶:۳۰<br>پنجشنبه: ۷ تا ۱۴</span>
            </li>
            <li>
              <span class="footer-icon">📷</span>
              <a href="#" class="footer-instagram">اینستاگرام Happy Land</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- بخش برند و کپی‌رایت -->
      <div class="footer-bottom">
        <div class="footer-brand">
          <a href="index.html" class="footer-logo">🎈 Happy Land</a>
          <p class="footer-desc">
            فروشگاه اینترنتی پوشاک کودک، نوزاد، زنانه و مردانه — با کیفیت و قیمت مناسب.
          </p>
        </div>
        <div class="footer-copy">
          <span>© ۲۰۲۴ Happy Land Lite — تمامی حقوق محفوظ است.</span>
          <span class="footer-credit">پروژه‌ی دانشگاهی — طراحی و توسعه با ❤</span>
        </div>
      </div>
    </div>
  `;
}
