<!DOCTYPE html>
{{--<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">--}}
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
      <div class="price">
        <div class="container">
          <h2 class="price-title price-top-title">{{__('The right pricing plans for you')}}</h2>
          <div class="price-wrapper">
            <div class="price-card">
              <div class="price-card-top">
                <span>€55</span>/{{__('month')}}
              </div>
              <p class="price-card-title">{{__('Monthly')}}</p>
              <a
                href="/admin/register"
                class="price-card-btn"
              >{{__('Choose plan')}}</a>
              <div
                class="price-card-trial"
                onClick={payTrial}
              >{{__('Try one month free')}}</div>
            </div>

            <div class="price-card">
              <div class="price-card-badge">{{__('Save')}} 15%</div>
              <div class="price-card-top">
                <span>€294</span>/{{__('semiannual')}}
              </div>
              <div class="price-card-per-month"><span>€49</span>/{{__('month')}}</div>
              <p class="price-card-title">{{__('semiannual')}}</p>
              <a
                href="/admin/register"
                class="price-card-btn"
              >{{__('Choose plan')}}</a>
              <div
                class="price-card-trial"
                onClick={payTrial}
              >{{__('Try one month free')}}</div>
            </div>

            <div class="price-card">
              <div class="price-card-badge">{{__('Save')}} 30%</div>
              <div class="price-card-top">
                <span>€468</span>/{{__('yearly')}}
              </div>
              <div class="price-card-per-month"><span>€39</span>/{{__('month')}}</div>
              <p class="price-card-title">{{__('yearly')}}</p>
              <a
                href="/admin/register"
                class="price-card-btn"
              >{{__('Choose plan')}}</a>
              <div
                class="price-card-trial"
                onClick={payTrial}
              >{{__('Try one month free')}}</div>
            </div>
          </div>
          <p class="price-text">{{__('Tied into another solution? If you have a notice period on your current booking system, you will receive Table Booking POS for free throughout that period, so you won’t have to pay for two subscriptions. You can set up the system for free using our Nubis Academy videos or let us set it up for you for')}} € 149</p>
          <div class="price-benefits">
            <h3 class="price-title">{{__('Benefits')}}</h3>
            <ul class="price-list">
              <li class="price-list-item">{{__('Fully integrated booking system')}}</li>
{{--              <li class="price-list-item">{{__('Takeaway module with its own payment')}}</li>--}}
              <li class="price-list-item">{{__('Giftcard module with direct payment to own account via stripe')}}</li>
              <li class="price-list-item">{{__('Waiting list')}}</li>
              <li class="price-list-item">{{__('Online payment via stripe for takeawey')}}</li>
              <li class="price-list-item">{{__('Deposit for no-shows')}}</li>
              <li class="price-list-item">{{__('Advance payment via own account via stripe')}}</li>
              <li class="price-list-item">{{__('Pre-ordering a menu')}}</li>
              <li class="price-list-item">{{__('Division of areas')}}</li>
              <li class="price-list-item">{{__('Guest exclusivity')}}</li>
              <li class="price-list-item">{{__('Reserve with Google partner')}}</li>
              <li class="price-list-item">{{__('SMS reminder')}}</li>
              <li class="price-list-item">{{__('Possibility of different setting times')}}</li>
              <li class="price-list-item">{{__('Questionnaire after visit')}}</li>
              <li class="price-list-item">{{__('Newsletter')}}</li>
              <li class="price-list-item">{{__('Run on all platforms')}}</li>
              <li class="price-list-item">{{__('Booking diagram')}}</li>
              <li class="price-list-item">{{__('Print of today’s booking')}}</li>
              <li class="price-list-item">{{__('Guest history')}}</li>
              <li class="price-list-item">{{__('Possibility of combined tables when booking online')}}</li>
              <li class="price-list-item">{{__('Concurrent users on the system')}}</li>
              <li class="price-list-item">{{__('Price per SMS')}}</li>
            </ul>
          </div>
          <p class="price-text">
            {{__('Notice: License comes with a Free 30 day full version trial. Refer to our Terms Of Service here.')}} <br />
            {{__('Support plan is available on paid licenses only and can be purchased separately or extended at a later time.')}}
          </p>
        </div>
      </div>
    </main>

    @include('partials/footer')

    <script src="/js/home.js"></script>
  </body>
</html>
