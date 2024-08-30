<style>
    @page{
        margin: 10px;
    }
    body{
        margin:0;
        padding: 0px 0px;
    }
    hr{
        border:0;
        border-top:1px dashed black;
    }
</style>
<body>
    @php
        /* @var \App\Models\Check $check */
        $place = $check->place;
    @endphp
    <div style="text-align: center">{{$place->name}}</div>
    <div style="text-align: center">{{$place->address}}</div>
    <div style="text-align: center">tel: {{$place->phone}}</div>
    <hr>
    <div>Receipt #{{$check->id}}</div>
    @foreach($check->products as $product)
        <div>{{$product->pivot->quantity}} x {{number_format($product->pivot->price,2)}}</div>
        <div>{{$product->name}} <span style="float: right">{{number_format($product->pivot->price * $product->pivot->quantity,2)}}</span></div>
    @endforeach
    <hr>
    <div>Discount: <span style="float: right">{{number_format($check->discount,2)}} {{(str_contains($check->discount_type,'percent') ? '%' : '')}}</span></div>
    <div style="float:none;clear:both;"></div>
    <div style="font-weight: bold;width:100%">Total: <span style="float: right">{{number_format($check->total,2)}}</span></div>
</body>
