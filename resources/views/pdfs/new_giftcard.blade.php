@php use Illuminate\Support\Facades\Storage; @endphp
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
<style>
    /*@page{
        margin: 0px;
    }*/
    body{
        font-family: "Poppins", sans-serif;
        margin:0;
        position: relative;
        padding: 100px 50px;
        text-align: center;
        background-image: url('data:image/png;base64,{{base64_encode(file_get_contents(public_path('images/new_giftcard_bg.png')))}}');
        background-size: cover;
    }
    h2{
        font-size: 37px;
        font-weight: 500;
        line-height: 1;
        text-align: center;
        color: #2B2525;
        margin: 0 0 8px;
    }
    h3{
        font-size: 24px;
        font-style: italic;
        font-weight: 500;
        line-height: 1;
        text-align: center;
        color: #2B2525;
        margin: 0 0 8px;
    }
    .img{
        height: 243px;
        width: 522px;
        background-size: cover;
        background-position: center;
        border-radius: 20px;
        margin-bottom: 11px;
        margin-left: auto;
        margin-right: auto;
    }
    .content_wrapper{
        width: 475px;
        margin: auto;
    }
    .text{
        font-size: 22px;
        line-height: 27.65px;
        text-align: center;
        min-height: 350px;
    }
    .amount{
        font-size: 24px;
        font-weight: 600;
        line-height: 29.05px;
    }
    .contact{
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        text-align: center;
        padding: 10px;
    }
    table{
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        line-height: 21px;
    }
    table td{
        width: 33%;
    }
    .water_mark{
        position: absolute;
        top:200px;
        left: -100px;
        color: rgba(100,100,100,0.3);
        font-size: 250px;
        transform: rotate(60deg);
        transform-origin: 50%;
    }
</style>
<body>
    @php
        /* @var \App\Models\Giftcard $giftcard */
        $place = $giftcard->place;
        $name = $giftcard->receiver_name ? $giftcard->receiver_name : $giftcard->name;
        $image_file_base64 = $giftcard->background_image ? 'data:image/'.pathinfo($giftcard->background_image, PATHINFO_EXTENSION).';base64,'.base64_encode(Storage::disk('public')->get($giftcard->background_image)) : '';
        $image = $giftcard->bg_url ? $giftcard->bg_url : $image_file_base64;
    @endphp
    @if($giftcard->examle)<div class="water_mark">Example</div>@endif
    <h3>{{__('Gift card')}}</h3>
    <h2>{{$place->name}}</h2>
    @if($image)
        <div class="img" style="background-image: url('{{$image}}')"></div>
    @endif
    <div class="content_wrapper">
        <div class="text"><b>{{__('Greetings To')}} {{$name}}</b><br>{{$giftcard->greetings}}</div>
        <table>
            <tr>
                <td style="text-align: left;"><b>{{__('Code')}}</b><br>{{$giftcard->code ? $giftcard->code : 'XXXXX'}}</td>
                <td style="text-align: center;"><b>{{__('Value')}}</b><br><span class="amount">{{$giftcard->initial_amount}} {{$place->setting('online-payment-currency')}}</span></td>
                <td style="text-align: right;"><b>{{__('Valid until')}}</b><br>{{\Carbon\Carbon::parse($giftcard->expired_at)->format('d.m.Y')}}</td>
            </tr>
        </table>
    </div>
    <div class="contact"><b>{{$place->name}}</b>, {{$place->address}} - {{$place->zip_code}} {{$place->city}}, {{$place->country->name}}, {{$place->phone}} {{$place->home_page}}</div>
</body>
