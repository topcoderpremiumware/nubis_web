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
    @foreach($text as $index => $line)
        <pre>{{$line}}</pre>
    @endforeach
</body>
