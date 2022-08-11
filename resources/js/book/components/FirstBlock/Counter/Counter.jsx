import React from "react";
import "./Counter.css";
import {useTranslation} from "react-i18next";

function Counter(props) {
  const { t } = useTranslation();
  return (
    <div className="counter">
      <button onClick={props.decrement} className="decrement">
        –
      </button>
      <div className="title-counter">{props.guestValue} {t('guests')}</div>
      <button onClick={props.increment} className="increment">
        +
      </button>
    </div>
  );
}

export default Counter;
