<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, width=device-width"/>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" />
    <link rel="stylesheet" href="/css/home.css">
    <title>{{ env('APP_NAME') }}</title>
    @include('partials/meta')
  </head>

  <body>
    @include('partials/header')

    <main class="main">
      <section class="hero">
        <img src="/images/home-bg.jpg" alt="Picture" class="hero-img">
        <div class="container hero-wrapper">
          <div>
            <h1 class="title">{{__('One booking system – One fixed low price including all features.')}}</h1>
            <p class="hero-text">{{__('Nubis reservation makes it easy to manage your restaurant`s table reservations. Stop wasting your time on daily tasks such as email replies, social media chats or phone calls. Allow guests to book a table online 24/7 and Nubis reservation will take care of the rest! The system is easy implemented to your website and there are no start up-fees ore extra costs.')}}</p>
            <a href="/pricing" class="link">{{__('Try one month free')}}</a>
          </div>
          <iframe
            width="606"
            height="339"
            src="https://www.youtube.com/embed/fZCxOi_f4zQ"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </section>

      <section class="features">
        <div class="container">
          <h2 class="title features-title">{{__('Features')}}</h2>
          <div class="swiper features-grid">
            <div class="swiper-wrapper">
              <div class="swiper-slide features-item">
                <img src="/images/feature-1.svg" alt="Icon" class="features-item-img">
                <h4 class="features-item-title">{{__('One booking system – one fixed low price')}}</h4>
                <p>{{__('Optimizes your guest flow, and optimizes the guest experience right from the first order, with all modern booking features in one...')}} <a href="/features" class="link">{{__('Reed more')}}</a></p>
              </div>
              <div class="swiper-slide features-item">
                <img src="/images/feature-2.svg" alt="Icon" class="features-item-img">
                <h4 class="features-item-title">{{__('Pre-ordering and payments from your customers. Sell gift cards with payment directly to your own bank account.')}}</h4>
                <p>{{__('Preordering of menus, events, sale of gift cards and...')}} <a href="/features" class="link">{{__('Reed more')}}</a></p>
              </div>
              <div class="swiper-slide features-item">
                <img src="/images/feature-3.svg" alt="Icon" class="features-item-img">
                <h4 class="features-item-title">{{__('Full control over gust flow')}}</h4>
                <p>{{__('Full control table plans to optimize your guest flow on all days of the week with multiple table-plans and setups for different settings.')}}</p>
              </div>
              <div class="swiper-slide features-item">
                <img src="/images/feature-4.svg" alt="Icon" class="features-item-img">
                <h4 class="features-item-title">{{__('Customize bookings')}}</h4>
                <p>{{__('Customize booking length for different settings, menus ore seasons etc. Integrated SMS and e-mail service, feedback from customers and free waiting list integration.')}}</p>
              </div>
              <div class="swiper-slide features-item">
                <img src="/images/feature-5.svg" alt="Icon" class="features-item-img">
                <h4 class="features-item-title">{{__('Unlimited features')}}</h4>
                <p>{{__('Unlimited numbers of bookings, simultaneous users, tables, areas, menus, rooms and even multiple restaurants, prepayment, deposits – all in one system.')}}</p>
              </div>
              <div class="swiper-slide features-item">
                <img src="/images/feature-6.svg" alt="Icon" class="features-item-img">
                <h4 class="features-item-title">{{__('Works on all platforms')}}</h4>
                <p>{{__('Works on computer, tablet, apple and androids with full integration.')}}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="advantages">
        <h2 class="advantages-title">{{__('What you can do with Nubis restaurant reservation software?')}}</h2>

        <div class="advantages-item">
          <img src="/images/home-bg.jpg" alt="Picture" class="advantages-img">
          <div class="container advantages-wrapper">
            <div>
              <p class="advantages-subtitle">{{__('Save more time')}}</p>
              <h3 class="title">{{__('Accept online reservations and save your time.')}}</h3>
              <p class="advantages-text">{{__('Stop wasting your valuable time on day-to-day email replies, social media chats or phone calls by choosing an automatic booking solution instead! Allow your guests to book a table online 24/7 and Nubis reservation will take care of the rest! Low fixed price, easy to set up and free try period.')}}</p>
              <a href="/pricing" class="link">{{__('Try one month free')}}</a>
            </div>
            <img src="/images/advantages-1.png" alt="Picture">
          </div>
        </div>

        <div class="advantages-item">
          <img src="/images/home-bg.jpg" alt="Picture" class="advantages-img">
          <div class="container advantages-wrapper">
            <div>
              <p class="advantages-subtitle">{{__('Decrease no-shows')}}</p>
              <h3 class="title">{{__('Full control over your guest flow.')}}</h3>
              <p class="advantages-text">{{__('Make your own intelligent table plans and customize them to each single weekday ore setting. Let the costumer preorder different menus directly when ordering a table. Set different table length for different menus and make different areas in the restaurant for instance “in the restaurant”, “in the bar”, “on the terrasse etc.')}}</p>
              <a href="/pricing" class="link">{{__('Try one month free')}}</a>
            </div>
            <img src="/images/advantages-2.png" alt="Picture">
          </div>
        </div>

        <div class="advantages-item">
          <img src="/images/home-bg.jpg" alt="Picture" class="advantages-img">
          <div class="container advantages-wrapper">
            <div>
              <p class="advantages-subtitle">{{__('Enjoy easier life')}}</p>
              <h3 class="title">{{__('Inform your guests of their reservation status and be able to take prepayment and deposits direct on ordering.')}}</h3>
              <p class="advantages-text">{{__('Decrease your restaurant no-shows and help shape your image by keeping all of your clients informed about their reservation status. All reservations will be followed-up with an instant confirmation email & SMS, as well as another kind reminder, days before your guests visit. Take prepayments and deposits and even sell gift cards direct from your own website directly into your own bank account.')}}</p>
              <a href="/pricing" class="link">{{__('Try one month free')}}</a>
            </div>
            <img src="/images/advantages-3.png" alt="Picture">
          </div>
        </div>
      </section>

      @include('partials/banner')
    </main>

    @include('partials/footer')

    <script src="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js"></script>
    <script src="/js/home.js"></script>
  </body>
</html>
