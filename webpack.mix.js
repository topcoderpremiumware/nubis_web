const mix = require('laravel-mix');
require('laravel-mix-compress');

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

mix
  // .js('resources/js/app.js', 'public/js')
  // .sass('resources/sass/app.scss', 'public/css')
  // .js('resources/js/book.js', 'public/js')
  // .sass('resources/sass/book.scss', 'public/css')
  // .js('resources/js/giftcard.js', 'public/js')
  .js('resources/js/new_giftcard.js', 'public/js')
  // .js('resources/js/feedback.js', 'public/js')
  // .js('resources/js/feedbacks.js', 'public/js')
  // .js('resources/js/home.js', 'public/js')
  // .sass('resources/sass/home.scss', 'public/css')
  // .js('resources/js/terms.js', 'public/js')
  .react()
  .compress()
