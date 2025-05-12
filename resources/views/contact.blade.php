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
      <section class="contact">
        <img src="/images/contact-circle-blue.png" alt="Picture" class="contact-img-1">
        <img src="/images/contact-circle-red.png" alt="Picture" class="contact-img-2">

        <div class="container">
          <h1 class="title">{{__("We’re here to help you out.")}}</h1>
          <p class="contact-text">{{__("If you have any questions, just reach out to us and we’ll respond as soon as we can. Please provide as much information as possible.")}}</p>

          <form action="/api/send_admin_contact" method="POST" class="contact-form">
              @if (session('status'))
                  <div class="alert alert-success">
                      {{ session('status') }}
                  </div>
              @endif
            <label class="contact-label">
              {{__('First Name')}} *
              <input type="text" name="first_name" required class="contact-input" placeholder="{{__('First Name')}}">
            </label>
            <label class="contact-label">
              {{__('Last Name')}} *
              <input type="text" name="last_name" required class="contact-input" placeholder="{{__('Last Name')}}">
            </label>
            <label class="contact-label">
              {{__('Email')}} *
              <input type="email" name="email" required class="contact-input" placeholder="{{__('Email')}}">
            </label>
            <label class="contact-label">
              {{__('Phone number')}} *
              <input type="text" name="phone" required class="contact-input" placeholder="{{__('Phone number')}}">
            </label>
            <label class="contact-label">
              {{__('Question')}} *
              <textarea name="message" cols="30" rows="5" required class="contact-textarea" placeholder="{{__('Type your question')}}"></textarea>
            </label>
            <button type="submit" class="contact-btn">{{__('Submit')}}</button>
            <p class="contact-form-text">{{__('By clicking submit you acknowledge to our')}} <a href="/terms" target="_blank">{{__('Privacy Policy')}}</a></p>
          </form>
        </div>
      </section>

      @include('partials/contact_banner')
    </main>

    @include('partials/footer')

    <script src="/js/home.js"></script>
  </body>
</html>
