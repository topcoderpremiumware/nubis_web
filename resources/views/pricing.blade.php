<!DOCTYPE html>
{{--<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">--}}
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, width=device-width"/>
    <link rel="icon" href="/images/logo.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css"/>
    <link rel="stylesheet" href="/css/home.css">
    <title>{{ env('APP_NAME') }}</title>
    @include('partials/meta')
</head>

<body>
@include('partials/header')

<main class="main">
    <div class="container">
        <div class="pricing_page">
            <div class="mini_title">{{__('Pricing')}}</div>
            <div class="title">{{__('Flexible Pricing for Your Business Needs')}}</div>
            <div>{{__('Find the right solution that fits your business and helps you achieve success effortlessly.')}}</div>
            <div class="payment_wrapper">
                <label class="switch" style="--switch-width: 357px; --switch-height: 48px; --switch-color: #FF9763">
                    <input type="checkbox" onchange="window.togglePricePeriod(event)"/>
                    <span class="slider">
                    <span class="text off">{{__('Price annually')}}</span>
                    <span class="text on">{{__('Price monthly')}}</span>
                  </span>
                </label>
                <div class="categories_wrapper annually">
                    <div class="price_category">
                        <div class="save">Save -25%</div>
                        <div class="prev">1195 DKK/Mo.</div>
                        <div class="price">895 DKK<span>/month</span></div>
                        <hr>
                        <div class="title">{{__('Full Package')}}</div>
                        <div class="subtitle">{{__('Billed annually.')}}</div>
                        <ul class="description">
                            <li>{{__('Complete Solution (POS, Booking, Gift Cards)')}}</li>
                            <li>{{__('Tax Authority Approved')}}</li>
                            <li>{{__('Easy Online Reservations')}}</li>
                            <li>{{__('Direct Gift Card Payments')}}</li>
                            <li>{{__('Integrated Payment System')}}</li>
                            <li>{{__('Automated SMS &amp; Email')}}</li>
                            <li>{{__('Full Online Reporting')}}</li>
                        </ul>
                        <a class="price_btn" href="/admin/register">{{__('Get started')}}</a>
                    </div>
                    <div class="price_category">
                        <div class="save">Save -17%</div>
                        <div class="prev">595 DKK/Mo.</div>
                        <div class="price">495 DKK<span>/month</span></div>
                        <hr>
                        <div class="title">{{__('Booking System')}}</div>
                        <div class="subtitle">{{__('Billed annually.')}}</div>
                        <ul class="description">
                            <li>2{{__('4/7 Online Booking')}}</li>
                            <li>{{__('Automatic SMS &amp; Emails')}}</li>
                            <li>{{__('Custom Table Layouts')}}</li>
                            <li>{{__('Guest Payment Integrated')}}</li>
                            <li>{{__('Custom Menus per Table')}}</li>
                        </ul>
                        <a class="price_btn" href="/admin/register">{{__('Get started')}}</a>
                    </div>
                    <div class="price_category">
                        <div class="save">Save -20%</div>
                        <div class="prev">495 DKK/Mo.</div>
                        <div class="price">395 DKK<span>/month</span></div>
                        <hr>
                        <div class="title">{{__('POS')}}</div>
                        <div class="subtitle">{{__('Billed annually.')}}</div>
                        <ul class="description">
                            <li>{{__('Fast Order Handling')}}</li>
                            <li>{{__('Flexible Payment Methods')}}</li>
                            <li>{{__('Tax Authority Approved')}}</li>
                            <li>{{__('Receipt Printing Included')}}</li>
                            <li>{{__('Easy Setup with Photos')}}</li>
                            <li>{{__('Free Reporting App')}}</li>
                        </ul>
                        <a class="price_btn" href="/admin/register">{{__('Get started')}}</a>
                    </div>
                    <div class="price_category">
                        <div class="save">Save -14%</div>
                        <div class="prev">695 DKK/Mo.</div>
                        <div class="price">595 DKK<span>/month</span></div>
                        <hr>
                        <div class="title">{{__('POS + Terminal')}}</div>
                        <div class="subtitle">{{__('Billed annually.')}}</div>
                        <ul class="description">
                            <li>{{__('Secure Payment Processing')}}</li>
                            <li>{{__('Low Fees (from 0.6%)')}}</li>
                            <li>{{__('Quick Payment Process')}}</li>
                            <li>{{__('Partial &amp; Group Payments')}}</li>
                            <li>{{__('Swedbank Compatible')}}</li>
                        </ul>
                        <a class="price_btn" href="/admin/register">{{__('Get started')}}</a>
                    </div>
                    <div class="price_category">
                        <div class="save">Save -22%</div>
                        <div class="prev">185 DKK/Mo.</div>
                        <div class="price">145 DKK<span>/month</span></div>
                        <hr>
                        <div class="title">{{__('Gift Cards')}}</div>
                        <div class="subtitle">{{__('Billed annually.')}}</div>
                        <ul class="description">
                            <li>{{__('Direct Payments to Account')}}</li>
                            <li>{{__('Unique Gift Experiences')}}</li>
                            <li>{{__('Easy Balance Management')}}</li>
                            <li>{{__('Online &amp; Physical Sales')}}</li>
                            <li>{{__('Integrated POS Redemption')}}</li>
                        </ul>
                        <a class="price_btn" href="/admin/register">{{__('Get started')}}</a>
                    </div>
                </div>
                <div class="categories_wrapper monthly">
                    <div class="price_category">
                        <div class="price">1195 DKK<span>/month</span></div>
                        <hr>
                        <div class="title">{{__('Full Package')}}</div>
                        <div class="subtitle">{{__('Billed monthly.')}}</div>
                        <ul class="description">
                            <li>{{__('Complete Solution (POS, Booking, Gift Cards)')}}</li>
                            <li>{{__('Tax Authority Approved')}}</li>
                            <li>{{__('Easy Online Reservations')}}</li>
                            <li>{{__('Direct Gift Card Payments')}}</li>
                            <li>{{__('Integrated Payment System')}}</li>
                            <li>{{__('Automated SMS &amp; Email')}}</li>
                            <li>{{__('Full Online Reporting')}}</li>
                        </ul>
                        <a class="price_btn" href="/admin/register">{{__('Get started')}}</a>
                    </div>
                    <div class="price_category">
                        <div class="price">595 DKK<span>/month</span></div>
                        <hr>
                        <div class="title">{{__('Booking System')}}</div>
                        <div class="subtitle">{{__('Billed monthly.')}}</div>
                        <ul class="description">
                            <li>{{__('24/7 Online Booking')}}</li>
                            <li>{{__('Automatic SMS &amp; Emails')}}</li>
                            <li>{{__('Custom Table Layouts')}}</li>
                            <li>{{__('Guest Payment Integrated')}}</li>
                            <li>{{__('Custom Menus per Table')}}</li>
                        </ul>
                        <a class="price_btn" href="/admin/register">{{__('Get started')}}</a>
                    </div>
                    <div class="price_category">
                        <div class="price">495 DKK<span>/month</span></div>
                        <hr>
                        <div class="title">{{__('POS')}}</div>
                        <div class="subtitle">{{__('Billed monthly.')}}</div>
                        <ul class="description">
                            <li>{{__('Fast Order Handling')}}</li>
                            <li>{{__('Flexible Payment Methods')}}</li>
                            <li>{{__('Tax Authority Approved')}}</li>
                            <li>{{__('Receipt Printing Included')}}</li>
                            <li>{{__('Easy Setup with Photos')}}</li>
                            <li>{{__('Free Reporting App')}}</li>
                        </ul>
                        <a class="price_btn" href="/admin/register">{{__('Get started')}}</a>
                    </div>
                    <div class="price_category">
                        <div class="price">695 DKK<span>/month</span></div>
                        <hr>
                        <div class="title">{{__('POS + Terminal')}}</div>
                        <div class="subtitle">{{__('Billed monthly.')}}</div>
                        <ul class="description">
                            <li>{{__('Secure Payment Processing')}}</li>
                            <li>{{__('Low Fees (from 0.6%)')}}</li>
                            <li>{{__('Quick Payment Process')}}</li>
                            <li>{{__('Partial &amp; Group Payments')}}</li>
                            <li>{{__('Swedbank Compatible')}}</li>
                        </ul>
                        <a class="price_btn" href="/admin/register">{{__('Get started')}}</a>
                    </div>
                    <div class="price_category">
                        <div class="price">185 DKK<span>/month</span></div>
                        <hr>
                        <div class="title">{{__('Gift Cards')}}</div>
                        <div class="subtitle">{{__('Billed monthly.')}}</div>
                        <ul class="description">
                            <li>{{__('Direct Payments to Account')}}</li>
                            <li>{{__('Unique Gift Experiences')}}</li>
                            <li>{{__('Easy Balance Management')}}</li>
                            <li>{{__('Online &amp; Physical Sales')}}</li>
                            <li>{{__('Integrated POS Redemption')}}</li>
                        </ul>
                        <a class="price_btn" href="/admin/register">{{__('Get started')}}</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

@include('partials/footer')

<script src="/js/home.js"></script>
</body>
</html>
