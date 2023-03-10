<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, width=device-width"/>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/home.css">
    <title>{{ env('APP_NAME') }}</title>
  </head>

  <body>
    <main class="main features-main">
      <section class="features thankyou">
        <div class="features-item thankyou-item">
          <h4 class="features-item-title thankyou-title">{{__('Thank you')}}</h4>
          <p><b>Some title: </b> some text</p>
          <p><b>Some title: </b> some text</p>
          <p><b>Some title: </b> some text</p>
        </div>
      </section>
    </main>
  </body>
</html>