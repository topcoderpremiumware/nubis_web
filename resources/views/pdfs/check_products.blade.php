@include('partials/fonts_poppins')
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
    @endphp
    <div style="font-size: 16pt;text-align: center">@if($print_type === 'all'){{__('Order board',[],$place->language)}} @else {{__('Ready to go',[],$place->language)}}@endif</div>
    <div style="text-align: center">{{now()->setTimezone($place->country->timezone)->locale($place->language)->isoFormat('DD MMMM Y HH:mm')}}</div>
    <br>
    <div>{{__('Table',[],$place->language)}} {{implode(', ',$order->table_ids)}}</div>
    <div>{{__('Employee',[],$place->language)}}: {{Auth::user()->name}}</div>
    <br>

    @foreach($products as $product)
        <div>{{$product['name']}} x {{$product['pivot']['quantity']}}</div>
    @endforeach
    @if($order->comment)
    <br>
    <div>{{$order->comment}}</div>
    @endif
</body>
