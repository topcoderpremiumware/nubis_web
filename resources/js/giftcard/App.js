import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './../i18nextConf';
import "./App.css";
import LoadingPage from "../components/LoadingPage";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

function App() {
  return (
    <Suspense fallback={<LoadingPage/>}>
      <div className="gift-content">
        <h1 className="gift-title">Create a gift card</h1>
        <Carousel
          swipeable={false}
          showArrows={false}
          showStatus={false}
          showIndicators={false}
          showThumbs={false}
          autoPlay={false}
        >
          <div className='gift-wrapper'>1</div>
          <div className='gift-wrapper'>2</div>
          <div className='gift-wrapper'>3</div>
        </Carousel>
      </div>
    </Suspense>
  );
}

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<App />, document.getElementById('app'));
}
