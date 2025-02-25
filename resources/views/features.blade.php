<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, width=device-width"/>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" />
    <link rel="stylesheet" href="/css/home.css">
    <title>{{ env('APP_NAME') }}</title>
      @include('partials/meta')
  </head>

  <body>
    @include('partials/header')

    <main class="main features-main">
      <section class="features-hero">
        <div class="container">
          <h1 class="title">{{__('One booking system. One fixed price.')}}</h1>
          <p class="features-hero-text">{{__('Easy to install. Use Nubis acadami videos to install Table Booking POSs for your restaurant ore we can due a complete setup online for you for only € 149')}}</p>
          <a href="#" class="link">{{__('Try one month free')}}</a>
        </div>
      </section>

      <img src="/images/features-circle-blue.png" alt="Picture" class="features-main-img-1">
      <img src="/images/features-circle-red.png" alt="Picture" class="features-main-img-2">
      <img src="/images/features-circle-blue.png" alt="Picture" class="features-main-img-3">

      <div class="features-detail">
        <div class="container">
          <h2 class="title">{{__('Manage all restaurant reservations with ease.')}}</h2>
          <p class="features-detail-text">{{__('Straightforward Table Booking POS management tools allow you to quickly view, add or edit reservations, move them around the day, and control reservation times. You can even control multiple restaurants from one single account!')}}</p>
          <div class="features-detail-wrapper">
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Increase revenue and improve service.')}}</span>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Increase your restaurant sales, promote events, and take prepayments on busy days. Grow your email database by integrating popular mailing software.')}}</span>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Use our interactive reporting dashboard to improve your restaurant’s performance. Take your business to the next level in efficiency.')}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="features-detail">
        <div class="container">
          <h2 class="title">{{__('Online reservations')}}</h2>
          <p class="features-detail-text">{{__('Accepting table reservations online helps you save time, grow your client database and allows your clients to feel more comfortable. Stay ahead of your competitors! ')}}</p>
          <div class="features-detail-wrapper">
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Real-time availability')}}</span>
              <p>{{__('We always check the latest availability before allowing guests to book online.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Dining room selection')}}</span>
              <p>{{__('Option to allow your guests to select their preferred dining area in your restaurant.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Special guest requests')}}</span>
              <p>{{__('Allow your guests to leave notes about special preferences, occasions, allergies.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Widget Responsiveness')}}</span>
              <p>{{__('No worries for your online widget compatibility: it works on all devices.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Last-minute setting')}}</span>
              <p>{{__('Receive more online table reservations with last-minute control function.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Instant bookings')}}</span>
              <p>{{__('Allow guests to book a table from any channel - website, Facebook or Google.')}}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="features-detail">
        <div class="container">
          <h2 class="title">{{__('Automatic notifications')}}</h2>
          <p class="features-detail-text">{{__('We always keep your guests informed by sending them automatic booking confirmations, reminders, cancellation notifications and feedback requests, by email as well as SMS message.')}}</p>
          <div class="features-detail-wrapper">
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Confirmation messages')}}</span>
              <p>{{__('After booking successfully, guests receive automatic emails and SMS notifications.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Reminder messages')}}</span>
              <p>{{__('We remind your guests about upcoming reservations a few days before the visit.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Automatic guest feedback')}}</span>
              <p>{{__('Dramatically improve your service with automatic feedback from your guests.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Multiple languages')}}</span>
              <p>{{__('SMS and email notifications for guests are available all languages.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Manager notifications')}}</span>
              <p>{{__('We keep the managers updated with new bookings by emails and SMS messages.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Custom messages')}}</span>
              <p>{{__('Emails and SMS messages can be customized to suit your needs.')}}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="features-detail">
        <div class="container">
          <h2 class="title">{{__('Table and floor setup')}}</h2>
          <p class="features-detail-text">{{__('Within several minutes you will have set up your dining areas, tables and individual preferences. ')}}</p>
          <div class="features-detail-wrapper">
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Easy table setting')}}</span>
              <p>{{__('Apply quick table cloning, set min & max number of guests, insert custom names.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Unlimited dining areas')}}</span>
              <p>{{__("Add any number of dining areas like bars, terraces, chef's tables or function rooms.")}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Floor plan drawing')}}</span>
              <p>{{__('Draw your restaurant floor plan with a drag & drop tool quickly and accurately.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Individual turnover times')}}</span>
              <p>{{__('Increase the guest capacity by controlling turnover time for each individual table.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Hidden dining areas')}}</span>
              <p>{{__('Hide the specific areas, such as seasonal outdoor tables or private dining zones.')}}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="features-detail">
        <div class="container">
          <h2 class="title">{{__('Time management settings')}}</h2>
          <p class="features-detail-text">{{__('Simple and efficient Table Booking POS tools allow you to manage reservation times effectively. Increase guest capacity, control kitchen load, and block unnecessary times in seconds. ')}}</p>
          <div class="features-detail-wrapper">
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Custom business hours')}}</span>
              <p>{{__('Set different restaurant opening hours for any day or period according to the need.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Quick time blocking')}}</span>
              <p>{{__('Make quick & instant changes to times that are available for online booking')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Time templates')}}</span>
              <p>{{__('Control reservation times for each table individually by creating time templates.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Dining area times')}}</span>
              <p>{{__('Control reservation times for each restaurant dining area individually.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Restaurant capacity control')}}</span>
              <p>{{__('Set a maximum number of guests allowed to book per day or per time slot.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Time zone')}}</span>
              <p>{{__('No matter which country you are based in, choose your local time zone and format.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Last-minute setting')}}</span>
              <p>{{__('Receive more online table reservations with our last-minute setting.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Reservation intervals')}}</span>
              <p>{{__('Stagger your load by accepting table reservations every 15 or 30 minutes.')}}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="features-detail">
        <div class="container">
          <h2 class="title">{{__('Reservation management')}}</h2>
          <p class="features-detail-text">{{__('View and manage your reservations by timeline or floor views. Simple yet advanced tools allow you to quickly add, edit or remove online, phone & group reservations as well as walk-ins. ')}}</p>
          <div class="features-detail-wrapper">
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('All-day reservations view')}}</span>
              <p>{{__('See your whole day’s reservations and any available restaurant tables at a glance.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Color-coded table status')}}</span>
              <p>{{__('Color-code the reservation status of each table for quick-glance comprehension.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Action buttons')}}</span>
              <p>{{__('Save time by accessing the most used functions with just one click.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Floor plan view')}}</span>
              <p>{{__('Use visual restaurant table layout, and add new reservations in semi-automatic manner.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Ways to add reservation')}}</span>
              <p>{{__('Add a new reservations in multiple ways that reflect your preferences at their best.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Drag & drop reservations')}}</span>
              <p>{{__('Move any reservation around the calendar or swap it with another when needed.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Sidebar reservation list')}}</span>
              <p>{{__('Check the easy-to-access reservation list with the most important information.')}}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="features-detail">
        <div class="container">
          <h2 class="title">{{__('Quick action tools')}}</h2>
          <p class="features-detail-text">{{__('Organise your daily schedule by using advanced Table Booking POS tools. No matter how many restaurants you have on the account, you can easily switch between them and manage all of your reservations smoothly.')}}</p>
          <div class="features-detail-wrapper">
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Guest search')}}</span>
              <p>{{__('Identify your loyal guests and access their information in seconds.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Print reservations')}}</span>
              <p>{{__('Print your full restaurant reservation list with just one click.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Reservation status')}}</span>
              <p>{{__('Set table status as confirmed, pending, arrived, paid, walk-in or no-show.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Language switch')}}</span>
              <p>{{__('Choose the language in which all the notifications will be sent to your guest.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Reservation comments')}}</span>
              <p>{{__('Leave notes about special requests, preferences, and dietary information.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Detailed guest information')}}</span>
              <p>{{__('Set the tags, view guest notes, loyalty & visit history, and review the ratings.')}}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="features-detail">
        <div class="container">
          <h2 class="title">{{__('Mobile Version')}}</h2>
          <p class="features-detail-text">{{__('Reservation management with Table Booking POS tool does not require an app. You can choose any device, log in to your account via any web browser and access your booking calendar, even on the go. ')}}</p>
          <div class="features-detail-wrapper">
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Adaptive layout')}}</span>
              <p>{{__('Use from any device whether it is iOS or Android – Table Booking POS works on both of them.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Automatic updates')}}</span>
              <p>{{__('Manage your reservations on the latest, automatically updated Table Booking POS version.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('App-free solution')}}</span>
              <p>{{__('Access the mobile version of Table Booking POS through any smartphone browser.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Desktop version')}}</span>
              <p>{{__('Easily switch from mobile version to desktop one and access all the features.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Quick booking')}}</span>
              <p>{{__('Add new reservations from your mobile device simply and extremely quickly.')}}</p>
            </div>
            <div class="features-detail-item">
              <span class="features-detail-item-title">{{__('Reservation list')}}</span>
              <p>{{__('Add, edit or cancel any reservation, by using the mobile reservation list.')}}</p>
            </div>
          </div>
        </div>
      </div>

      @include('partials/banner')
    </main>

    @include('partials/footer')

    <script src="/js/home.js"></script>
  </body>
</html>
