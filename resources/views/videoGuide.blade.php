<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
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

  <body>
    @include('partials/header')

    <main class="main">
      <section class="guide">
        <img src="/images/plate-1.png" alt="Picture" class="guide-img-1" />
        <img src="/images/plate-2.png" alt="Picture" class="guide-img-2" />
        <img src="/images/plate-3.png" alt="Picture" class="guide-img-3" />

        <div class="guide-container">
          <h1 class="guide-title">{{__('How to Use our System ?')}}</h1>
            @foreach($guides as $guide)
              <div class="guide-item">
                <div class="guide-item-wrapper">
                  <h3 class="guide-item-title">{{$guide->title}}</h3>
                  <p class="guide-item-text">{{$guide->description}}</p>
                  <a href="{{$guide->page_url}}" target="_blank" class="guide-item-link">{{__('Try it Now')}}</a>
                </div>
                <iframe
                  width="606"
                  height="339"
                  src="https://www.youtube.com/embed/{{$guide->youtube_id}}"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            @endforeach
        </div>
      </section>

      @include('partials/banner')
    </main>

    @include('partials/footer')

    <script src="/js/home.js"></script>
  </body>
</html>
