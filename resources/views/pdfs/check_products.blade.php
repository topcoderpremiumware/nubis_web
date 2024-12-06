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
</body>
