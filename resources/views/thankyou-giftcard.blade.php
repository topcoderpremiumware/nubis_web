<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, width=device-width"/>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/home.css">
    <title>{{ env('APP_NAME') }}</title>
  </head>

  <body>
    <main class="main features-main">
      <section class="features thankyou">
        <div class="features-item thankyou-item">
          <h4 class="features-item-title thankyou-title">{{__('Thank you')}}</h4>
            @php
                /* @var $giftcard */
                $place = $giftcard->place;
            @endphp
            <p><b>{{$place->name}}</b></p>
            <p><b>id: </b> {{$giftcard->id}}</p>
            <p><b>{{$place->address}}</b></p>
            <p><b>{{$place->zip_code}} {{$place->city}}</b></p>
            <p><b>{{$place->country->name}}</b></p>
            <p><b>{{__('Amount')}}: </b> {{$giftcard->initial_amount}} {{$place->setting('online-payment-currency')}}</p>
            <p><b>{{__('Your contact information')}}: </b></p>
            <p>{{$giftcard->name}}</p>
            <p>{{$giftcard->email}}</p>
            <p><a href="{{env('APP_URL')}}/giftcard/{{$place->id}}">{{__('New booking')}}</a></p>
        </div>
      </section>
    </main>
  </body>
</html>
