const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', 'public/js')
    .react()
    .sass('resources/sass/app.scss', 'public/css');

mix.js('resources/js/book.js', 'public/js')
  .react()
  .sass('resources/sass/book.scss', 'public/css');

mix.js('resources/js/giftcard.js', 'public/js')
  .react();

mix.js('resources/js/feedback.js', 'public/js')
  .react();

mix.js('resources/js/feedbacks.js', 'public/js')
  .react();

mix.js('resources/js/home.js', 'public/js')
  .react()
  .sass('resources/sass/home.scss', 'public/css');

mix.js('resources/js/terms.js', 'public/js')
  .react();
