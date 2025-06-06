<footer class="footer">
  <div class="container">
    <div class="footer-wrapper">
      <a class="footer-logo" href="/">
        <img src='/images/footer-logo.png' width="130"/>
      </a>
      <nav class="footer-nav">
        <a href="/" class="footer-nav-link">{{ __('Home') }}</a>
        <a href="/features" class="footer-nav-link">{{ __('Features') }}</a>
        <a href="/pricing" class="footer-nav-link">{{ __('Prices') }}</a>
        <a href="/about" class="footer-nav-link">{{ __('About us') }}</a>
        <a href="/contact" class="footer-nav-link">{{ __('Contact') }}</a>
      </nav>
      <ul class="footer-list">
        <li><a href="#">Fb</a></li>
        <li><a href="#">Tw</a></li>
        <li><a href="#">Ln</a></li>
      </ul>
    </div>
    <hr>
    <div class="footer-wrapper">
      <div class="footer-address">{{ __('1088, North Street, Alexandria, AU') }} | <a href="mailto:{{env('MAIL_FROM_ADDRESS')}}">{{env('MAIL_FROM_ADDRESS')}}</a> | <a href="tel:+4531905250">+4531905250</a></div>
        <div class="footer-copy"><a href="/terms">Terms of use</a> | &copy; 2022, {{ __('All Rights Reserved') }}</div>
    </div>
  </div>
</footer>
