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
                /* @var $order */
                $place = $order->place;
                $customer = $order->customer;
            @endphp
            <p><b>{{$place->name}}</b></p>
            <p><b>id: </b> {{$order->id}}</p>
            <p><b>{{$place->address}}</b></p>
            <p><b>{{$place->zip_code}} {{$place->city}}</b></p>
            <p><b>{{$place->country->name}}</b></p>
            <p><b>{{__('Guests')}}: </b> {{$order->seats}}</p>
            <p><b>{{__('Day/time')}}: </b> {{$order->reservation_time->format('d-m-Y H:i')}}</p>
            <p><b>{{__('Your contact information')}}: </b></p>
            <p>{{$customer->first_name}} {{$customer->last_name}}</p>
            <p>{{$customer->email}}</p>
            <p>{{$customer->phone}}</p>
            <p>{{$customer->zip_code}}</p>
            <p><b>{{__('Comment')}}: </b> {{$order->comment}}</p>
            <p><b>{{__('Type')}}: </b> {{$order->is_take_away ? __('Take away') : __('Eat here')}}</p>
            <p><a href="{{env('APP_URL')}}/book/{{$place->id}}"><u>{{__('Cancel a booking')}}</u></a></p>
            <p><a href="{{env('APP_URL')}}/book/{{$place->id}}"><u>{{__('New booking')}}</u></a></p>
        </div>
      </section>
    </main>
  </body>
</html>
