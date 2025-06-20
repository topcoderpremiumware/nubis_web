@include('partials/fonts_poppins')
<style>
    @page{
        margin: 10px;
    }
    body{
        font-family: "Poppins", sans-serif;
        margin:0;
        padding: 0px 0px;
        font-size: 12pt;
        line-height: 1;
        overflow-wrap: anywhere;
    }
    table{
        border:1px solid black;
        border-spacing: 0;
        border-collapse: collapse;
        width: 100%;
    }
    table td{
        border:1px solid black;
        padding: 4px 5px;
    }
</style>
<body>
    <table>
        <tr><td><b>ID</b></td><td><b>Payment method</b></td><td><b>Given</b></td><td><b>Description</b></td><td><b>Total</b></td></tr>
        @foreach($data as $row)
            <tr>
                <td>{{$row['id']}}</td>
                <td>{{$row['payment_method']}}</td>
                <td>{{$row['given']}}</td>
                <td>{{$row['description']}}</td>
                <td style="text-align: right">{{$row['total']}}</td>
            </tr>
        @endforeach
    </table>
</body>
