<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, width=device-width"/>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" />
    <link rel="stylesheet" href="/css/home.css">
    <title>{{ env('APP_NAME') }}</title>
  </head>

  <body>
    <header class="header">
      <div class="container header-wrapper">
        <a class="header-logo" href="/">
          <img src='/images/logo.png' width="156"/>
        </a>
        <nav class="nav">
          <a href="#" class="nav-link nav-link-active">Home</a>
          <a href="#" class="nav-link">Features</a>
          <a href="#" class="nav-link">Prices</a>
          <a href="#" class="nav-link">About us</a>
          <a href="#" class="nav-link">Contact</a>
        </nav>
        <ul class="header-actions">
          <!-- @include('partials/language_switcher') -->
          <li><a href="#" class="header-action-link">Sign up</a></li>
          <li><a href="/admin/login" class="header-action-link header-action-link-accent">Login In</a></li>
        </ul>
      </div>
    </header>
    
    <main class="main">
      <section class="hero">
        <img src="/images/hero-bg.jpg" alt="Picture" class="hero-img">
        <div class="container hero-wrapper">
          <div>
            <h1 class="title">One booking system – One fixed low price including all features.</h1>
            <p class="hero-text">Nubis reservation makes it easy to manage your restaurant`s table reservations. Stop wasting your time on daily tasks such as email replies, social media chats or phone calls. Allow guests to book a table online 24/7 and Nubis reservation will take care of the rest! The system is easy implemented to your website and there are no start up-fees ore extra costs.</p>
            <a href="#" class="link">Try one month free</a>
          </div>
          <iframe 
            width="606" 
            height="339" 
            src="https://www.youtube.com/embed/Sz1mQKQQhVk" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
          ></iframe>
        </div>
      </section>

      <section class="features">
        <div class="container">
          <h2 class="title features-title">Features</h2>
          <div class="swiper features-grid">
            <div class="swiper-wrapper">
              <div class="swiper-slide features-item">
                <img src="" alt="" class="features-item-img">
                <h4 class="features-item-title">One booking system – one fixed low price</h4>
                <p>Optimizes your guest flow, and optimizes the guest experience right from the first order, with all modern booking features in one... <a href="#" class="link">Reed more</a></p>
              </div>
              <div class="swiper-slide features-item">
                <img src="" alt="" class="features-item-img">
                <h4 class="features-item-title">Full control over gust flow</h4>
                <p>Full control table plans to optimize your guest flow on all days of the week with multiple table-plans and setups for different seettings.</p>
              </div>
              <div class="swiper-slide features-item">
                <img src="" alt="" class="features-item-img">
                <h4 class="features-item-title">Unlimited features</h4>
                <p>Unlimited numbers of bookings, simultaneous users, tables, areas, menus, rooms and even multiple restaurants, prepayment, deposits – all in one system.</p>
              </div>
              <div class="swiper-slide features-item">
                <img src="" alt="" class="features-item-img">
                <h4 class="features-item-title">Pre-ordering and payments from your customers. Sell gift cards and take- a- way with payment directly to your own bank account.</h4>
                <p>Preordering of menus, events, sale of gift cards and take-away with ... <a href="#" class="link">Reed more</a></p>
              </div>
              <div class="swiper-slide features-item">
                <img src="" alt="" class="features-item-img">
                <h4 class="features-item-title">Customize bookings</h4>
                <p>Customize booking length for different settings, menus ore seasons etc. Integrated SMS and e-mail service, feedback from customers and free waiting list integration.</p>
              </div>
              <div class="swiper-slide features-item">
                <img src="" alt="" class="features-item-img">
                <h4 class="features-item-title">Works on all platforms</h4>
                <p>Works on computer, tablet, apple and androids with full integration.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js"></script>
    <script src="/js/home.js"></script>
  </body>
</html>