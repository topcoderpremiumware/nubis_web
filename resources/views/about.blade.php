<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" translate="no">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, width=device-width"/>
      <link rel="icon" href="/images/logo.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" />
    <link rel="stylesheet" href="/css/home.css">
    <title>{{ env('APP_NAME') }}</title>
    @include('partials/meta')
  </head>

  <body translate="no">
    @include('partials/header')

    <main class="main">
      <section class="about">
        <div class="container">
          <h1 class="title">{{__('About us')}}</h1>
          <p class="about-text">{{__("The idea for Table Booking POS arose in Denmark as a result of the Corona crisis, which especially focused on the overall cost structure for many restaurants. The idea was to create a reliable booking system with all the features a restaurant needs in everyday life at a fixed low price, and which at the same time is easy to set up. A system where the restaurant can also sell gift cards, take away and receive payments directly into their own account without expensive intermediaries. A system where you can choose to set up the system and only pay a fixed price while having the opportunity to up it completely installed for an extremely low price. Away with expensive fixed costs and intermediaries. Once installed, it is just a useful tool for your restaurant whether you use a simple set up or choose to use all our features. A fixed low price. Fast, efficient and reliably developed by some of the world's best international programmers in a network with a fixed base and values in Denmark.")}}</p>
          <iframe
            width="100%"
            height="600"
            src="https://www.youtube.com/embed/4k2b3fdLE6Q"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>

{{--          <h2 class="title about-title">{{__('Common Questions')}}</h2>--}}
{{--          <div class="about-accordion">--}}
{{--            Can I download future updates?--}}
{{--            <div class="about-accordion-icon">--}}
{{--              <span></span>--}}
{{--              <span></span>--}}
{{--            </div>--}}
{{--          </div>--}}
{{--          <div class="about-panel">--}}
{{--            <p>Future updates. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>--}}
{{--          </div>--}}
        </div>
      </section>

      @include('partials/banner')
    </main>

    @include('partials/footer')

    <script src="/js/home.js"></script>
  </body>
</html>
