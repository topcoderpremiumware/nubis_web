<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
<style>
    @page{
        margin: 10px;
    }
    body{
        font-family: "Poppins", sans-serif;
        margin:0;
        padding: 0px 0px;
        font-size: 10pt;
        line-height: 1;
        overflow-wrap: anywhere;
    }
    hr{
        border:0;
        border-top:1px solid black;
    }
</style>
<body>
    @php
        /* @var \App\Models\Check $check */
        $place = $check->place;
        $currency = $place->setting('online-payment-currency');
        $vat = (float)$check->total - ((float)$check->total / 1.25);
    @endphp
    <div style="text-align: center">{{$place->name}}</div>
    @if($place->address)<div style="text-align: center">{{$place->address}}</div>@endif
    @if($place->phone)<div style="text-align: center">tel: {{$place->phone}}</div>@endif
    @if($place->home_page)<div style="text-align: center">{{$place->home_page}}</div>@endif
    @if($place->email)<div style="text-align: center">{{$place->email}}</div>@endif
    <hr>
    <div style="font-size: 16pt;text-align: center">{{__('Receipt',[],$place->language)}}</div>
    <div style="text-align: center">{{now()->format('d F Y H:i')}}</div>
    <div style="text-align: center">{{__('Receipt',[],$place->language)}} #{{$check->id}}</div>
    <hr>
    @foreach($check->products as $product)
        <div>{{$product->name}}</div>
        <div>{{$product->pivot->quantity}} x {{number_format($product->pivot->price,2)}} <span style="float: right">{{number_format($product->pivot->price * $product->pivot->quantity,2)}}</span></div>
    @endforeach
    <hr>
    <div>{{__('Subtotal',[],$place->language)}} <span style="float: right">{{number_format($check->subtotal,2)}} {{$currency}}</span></div>
    <div style="float:none;clear:both;"></div>
    <div>{{__('Discount',[],$place->language)}} <span style="float: right">{{number_format($check->discount,2)}} {{(str_contains($check->discount_type,'percent') ? '%' : $currency)}}</span></div>
    <div style="float:none;clear:both;"></div>
    <div>{{__('VAT',[],$place->language)}} 25% <span style="float: right">{{number_format($vat,2)}} {{$currency}}</span></div>
    <div style="float:none;clear:both;"></div>
    <div>{{__('Total',[],$place->language)}} <span style="float: right;font-weight:bold;font-size: 16pt">{{number_format($check->total,2)}} {{$currency}}</span></div>
</body>
