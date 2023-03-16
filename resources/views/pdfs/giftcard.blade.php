<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
<style>
    /*@page{
        margin: 0px;
    }*/
    body{
        font-family: "Poppins", sans-serif;
        margin:0;
        background-image: url({{url('/')}}/images/features-bg.jpg);
        background-repeat: no-repeat;
        background-size: cover;
        position: relative;
        padding: 51px 50px 58px;
    }
    h2{
        text-align: center;
        font-size: 50px;
        color: #F36823;
        margin: 0 0 20px;
    }
    h3{
        text-transform: uppercase;
        text-align: center;
        font-size: 30px;
        margin: 0 0 20px;
    }
    .hr_c{
        border-top: 3px solid #F36823;
        margin: 0 auto 100px;
        width: 300px;
    }
    .value{
        text-align: center;
        font-size: 30px;
        margin: 0 0 0px;
    }
    .amount{
        text-align: center;
        font-size: 50px;
        margin: 0 0 20px;
    }
    .contact{
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        text-align: center;
        padding: 10px;
    }
    .bottom_img{
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        opacity: 30%;
    }
</style>
<body>
    @php
        /* @var $giftcard */
        $place = $giftcard->place;
        $file = $place->files()->where('purpose','online_booking_picture')->first();
        $img = $file->filename;
    @endphp
    <h2>{{$place->name}}</h2>
    <h3>{{__('Giftcard')}}</h3>
    <div class="hr_c"></div>
    <div class="value">{{__('Value')}}</div>
    <div class="amount">{{$giftcard->initial_amount}} {{$place->setting('online-payment-currency')}}</div>
    <p><b>{{__('Code')}}:</b> {{$giftcard->code}}</p>
    <p><b>{{__('Valid until')}}:</b> {{\Carbon\Carbon::parse($giftcard->expired_at)->format('d.m.Y')}}</p>
    <div class="contact">{{$place->name}} | {{$place->address}} - {{$place->zip_code}} {{$place->city}}, {{$place->country->name}} | +{{$place->phone}} | {{$place->home_page}}</div>
    <img class="bottom_img" src="{{asset('storage/'.$img)}}">
</body>
