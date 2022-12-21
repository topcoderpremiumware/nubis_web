import React, { Suspense, useState } from 'react';
import ReactDOM from 'react-dom';
import './../i18nextConf';
import "./App.css";
import LoadingPage from "../components/LoadingPage";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import GiftCounter from './components/Counter/Counter';
import AmountInput from './components/AmountInput/AmountInput';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import GiftForm from './components/Form/Form';

const maxCount = 100
const minAmount = 100
const maxAmount = 10000

function App() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [count, setCount] = useState(1)
  const [amount, setAmount] = useState(minAmount)
  const [email, setEmail] = useState('your')

  const onBack = () => {
    setCurrentSlide(prev => prev - 1)
  }
  const onNext = () => {
    setCurrentSlide(prev => prev + 1)
  }

  const onCreate = async (formData) => {
    const data = {
      count,
      amount,
      email,
      ...formData
    }
    console.log('data', data)
    onNext()
  }

  return (
    <Suspense fallback={<LoadingPage/>}>
      <div className="gift-content">
        <h1 className="gift-title">Create a gift card</h1>
        <Carousel
          selectedItem={currentSlide}
          swipeable={false}
          showArrows={false}
          showStatus={false}
          showIndicators={false}
          showThumbs={false}
          autoPlay={false}
          className="gift-carousel"
        >
          <div className='gift-wrapper'>
            <p className="gift-text">Type in the amount for your Gift Card, and click NEXT</p>
            <div className="gift-step-1-wrapper">
              <GiftCounter
                value={count}
                max={maxCount}
                setValue={setCount}
              />
              <AmountInput
                value={amount}
                min={minAmount}
                max={maxAmount}
                setValue={setAmount}
                isError={amount < minAmount || amount > maxAmount}
              />
            </div>
            <div className="gift-btns-wrapper">
              <button 
                className="gift-btn" 
                onClick={() => {
                  if(amount >= minAmount && amount <= maxAmount) {
                    onNext()
                  }
                }}
              >Next →</button>
            </div>
          </div>

          <div className='gift-wrapper'>
            <p className="gift-text">Choose how you would like the Gift Card(s) to be delivered</p>
            <RadioGroup
              value={email}
              onChange={ev => setEmail(ev.target.value)}
            >
              <FormControlLabel value="your" control={<Radio color="default" />} label="Send to YOUR e-mail (print yourself)" />
              <FormControlLabel value="receivers" control={<Radio color="default" />} label="Send to RECEIVERS e-mail" />
            </RadioGroup>
            <div className="gift-btns-wrapper">
              <button className="gift-btn" onClick={onBack}>← Back</button>
              <button className="gift-btn" onClick={onNext}>Next →</button>
            </div>
          </div>

          <div className='gift-wrapper'>
            <p className="gift-text">
              {email === 'your' 
                ? 'Type in your e-mail address below and click NEXT' 
                : 'Type in your e-mail address, and the e-mail addres for the receiver'
              }
            </p>
            <GiftForm
              onSubmit={onCreate}
              onBack={onBack}
            />
          </div>

          <div className='gift-wrapper'>
            {/* <p className="gift-text"></p> */}
            yow
            <div className="gift-btns-wrapper">
              <button className="gift-btn" onClick={onBack}>← Back</button>
            </div>
          </div>
        </Carousel>
      </div>
    </Suspense>
  );
}

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<App />, document.getElementById('app'));
}
