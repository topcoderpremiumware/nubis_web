<header class="header">
  <div class="container">
    <div class="header-wrapper-mobile">
      <a class="header-logo-mobile" href="/">
        <img src='/images/logo.png' width="156"/>
      </a>
      <div class="hamburger">
        <div class="hamburger-line hamburger-top"></div>
        <div class="hamburger-line hamburger-mid"></div>
        <div class="hamburger-line hamburger-bottom"></div>
      </div>
    </div>
    <div class="header-wrapper">
      <a class="header-logo" href="/">
        <img src='/images/logo.png' width="156"/>
      </a>
      <nav class="nav">
        <a href="#" class="nav-link nav-link-active">{{ __('Home') }}</a>
        <a href="#" class="nav-link">{{ __('Features') }}</a>
        <a href="#" class="nav-link">{{ __('Prices') }}</a>
        <a href="#" class="nav-link">{{ __('About us') }}</a>
        <a href="#" class="nav-link">{{ __('Contact') }}</a>
      </nav>
      <ul class="header-actions">
        @include('partials/language_switcher')
        <li><a href="#" class="header-action-link">{{ __('Sign up') }}</a></li>
        <li><a href="/admin/login" class="header-action-link header-action-link-accent">{{ __('Login In') }}</a></li>
      </ul>
    </div>
  </div>
</header>