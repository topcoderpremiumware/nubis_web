/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

require('./bootstrap');

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const hamburger = document.querySelector('.hamburger')
const headerWrapper = document.querySelector('.header-wrapper')

hamburger.addEventListener('click', () => {
  document.querySelector('html').classList.toggle('hidden')
  hamburger.classList.toggle('hamburger-active')
  headerWrapper.classList.toggle('header-wrapper-active')
})

const featuresSwiper = document.querySelector('.features-grid')

if(featuresSwiper) {
  new Swiper(featuresSwiper, {
    slidesPerView: 1.2,
    spaceBetween: 18,
    breakpoints: {
      481: {
        slidesPerView: 2,
        grid: {
          rows: 3,
        },
        spaceBetween: 20,
      },
      1025: {
        slidesPerView: 3,
        grid: {
          rows: 2,
        },
        spaceBetween: 30,
      }
    }
  });
}
