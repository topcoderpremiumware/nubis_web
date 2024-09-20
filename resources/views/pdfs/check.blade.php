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
        $order = $check->order;
        $currency = $place->setting('online-payment-currency');
        $vat = 0;
        foreach ($check->products as $product) {
            $p_total = (float)$product->pivot->price * (float)$product->pivot->quantity;
            if($check->discount){
                if(str_contains($check->discount_type,'percent')){
                    $p_discount = $p_total * $check->discount / 100;
                }else{
                    $p_discount = $p_total * $check->discount / $check->subtotal;
                }
                $p_total = $p_total - $p_discount;
            }

            $vat += $p_total - $p_total / (1 + $product->tax / 100);
        }
    @endphp
    <div style="text-align: center">{{$place->name}}</div>
    @if($place->address)<div style="text-align: center">{{$place->address}}</div>@endif
    @if($place->phone)<div style="text-align: center">tel: {{$place->phone}}</div>@endif
    @if($place->home_page)<div style="text-align: center">{{$place->home_page}}</div>@endif
    @if($place->email)<div style="text-align: center">{{$place->email}}</div>@endif
    @if($place->tax_number)<div style="text-align: center">{{__('VAT number',[],$place->language)}}: {{$place->tax_number}}</div>@endif
    <hr>
    <div style="font-size: 16pt;text-align: center">{{__('Receipt',[],$place->language)}}</div>
    <div style="text-align: center">{{now()->locale($place->language)->isoFormat('DD MMMM Y HH:mm')}}</div>
    <div style="text-align: center">{{__('Receipt',[],$place->language)}} #{{$check->id}}</div>
    <div style="text-align: center">{{__('Cashier',[],$place->language)}}: {{$check->printed->name}}</div>
    <hr>
    <div>{{__('Booking id',[],$place->language)}} # {{$order->id}}</div>
    <div>{{__('Time',[],$place->language)}}: {{$order->reservation_time->locale($place->language)->isoFormat('DD MMMM Y HH:mm')}}</div>
    <div>{{__('Seats',[],$place->language)}}: {{$order->seats}}</div>
    <div>{{__('Tables',[],$place->language)}}: {{implode(',',$order->table_ids)}}</div>
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
    <div style="float:none;clear:both;"></div>
    <hr>
    @if($check->payment_method === 'card')
        <div>{{__('Received',[],$place->language)}} {{__('on card',[],$place->language)}}
            <span style="float: right;">{{number_format($check->total,2)}} {{$currency}}</span></div>
    @endif
    @if($check->payment_method === 'cash')
        <div>{{__('Received',[],$place->language)}} {{__('in cash',[],$place->language)}}
            <span style="float: right;">{{number_format($check->total,2)}} {{$currency}}</span></div>
    @endif
    @if($check->payment_method === 'card/cash')
        <div>{{__('Received',[],$place->language)}} {{__('on card',[],$place->language)}}
            <span style="float: right;">{{number_format($check->card_amount,2)}} {{$currency}}</span></div>
        <div style="float:none;clear:both;"></div>
        <div>{{__('Received',[],$place->language)}} {{__('in cash',[],$place->language)}}
            <span style="float: right;">{{number_format($check->cash_amount,2)}} {{$currency}}</span></div>
    @endif
    <div style="float:none;clear:both;"></div>
</body>
