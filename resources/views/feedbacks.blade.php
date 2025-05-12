<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" translate="no">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="initial-scale=1, width=device-width"/>
        <link rel="icon" href="/images/logo.ico">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css?family=Lusitana:regular,700" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap"
            rel="stylesheet">
        <link rel="stylesheet" href="/css/feedbacks.css">
        <title>{{ env('APP_NAME') }}</title>
        @include('partials/meta')
    </head>

    <body translate="no">
        <div id="app"></div>
        <script src="{{asset('js/feedbacks.js')}}"></script>
    </body>

</html>
