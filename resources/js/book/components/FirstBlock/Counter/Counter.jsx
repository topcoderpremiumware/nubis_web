import React from "react";
import "./Counter.css";
import {useTranslation} from "react-i18next";

function Counter(props) {
  const { t } = useTranslation();

  function increment() {
    if(props.guestValue < props.maxSeats)
    props.setGuestValue(props.guestValue + 1);
  }

  function decrement() {
    if (props.guestValue !== 0) {
      props.setGuestValue(props.guestValue - 1);
    }
  }

  return (
    <div className="counter">
      <button onClick={decrement} className="decrement">
        –
      </button>
      <div className="title-counter">{props.guestValue} {t('guests')}</div>
      <button onClick={increment} className="increment">
        +
      </button>
    </div>
  );
}

export default Counter;
