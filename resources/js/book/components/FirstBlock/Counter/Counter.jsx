import React from "react";
import "./Counter.css";
import {useTranslation} from "react-i18next";

function Counter(props) {
  const { t } = useTranslation();

  function increment() {
    if(!props.max || props.value < props.max)
    props.onChange(props.value + 1);
  }

  function decrement() {
    if (props.value !== 0) {
      props.onChange(props.value - 1);
    }
  }

  return (
    <div className="counter">
      <button onClick={decrement} className="decrement">
        –
      </button>
      <div className="title-counter">{props.value}</div>
      <button onClick={increment} className="increment">
        +
      </button>
    </div>
  );
}

export default Counter;
