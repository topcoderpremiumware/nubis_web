<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="initial-scale=1, width=device-width"/>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css?family=Lusitana:regular,700" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap"
            rel="stylesheet">
        <link rel="stylesheet" href="/css/app.css">
        <title>{{ env('APP_NAME') }}</title>

    </head>

    <body>
        <nav class="navbar navbar-expand-lg navbar-dark sticky-top">
            <div class="container">
                <a class="navbar-brand" href="/"><img src='/images/logo.png' width="90"/></a>
                <ul class="navbar-nav w-100">
                    @include('partials/language_switcher')
                    <li class="nav-item"><a class="nav-link" href="/admin/login">Sign in</a></li>
                </ul>
            </div>
        </nav>
        <div>
            {{ __('Landing page here') }}
        </div>
        <script src="/js/home.js"></script>
    </body>

</html>
