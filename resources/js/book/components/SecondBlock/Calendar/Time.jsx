import React from "react";
import "./Time.css";
import Arrow from "../Calendar/vector.jpg";
import ArrowLeft from "../Calendar/vectorleft.png";
import { useState } from "react";
import { Children } from "react";

function Time(props) {
  const [activeButton, setActiveButton] = useState(null);

  const sliderRef = React.createRef();

  const buttonRight = () => {
    sliderRef.current.scrollLeft += 200
  };
  const buttonLeft = () => {
    sliderRef.current.scrollLeft -= 200
  };

  console.log("Times: ", props.times);

  return (
    <div className="mainblock">
      <button className="slider_arrow left" type="button" onClick={buttonLeft}>
        <img src={ArrowLeft} alt="" />
      </button>
      <div className="block-button__slider" ref={sliderRef}>
        {Children.toArray(
          props.times?.map((oneTime, i) => {
            return (
              <div className="block-buttons">
                <div
                  onClick={() => {
                    return (
                      setActiveButton(i), props.setSelectedTime(oneTime.time), (props.hasOwnProperty('setTimelineType') && props.setTimelineType())
                    );
                  }}
                >
                  <button
                    className={`time-button${
                      activeButton === i ? " active-button" : ""
                    }`}
                  >
                    {oneTime.shortTime}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <button className="slider_arrow right" type="button" onClick={buttonRight}>
        <img src={Arrow} alt="" />
      </button>
    </div>
  );
}

export default Time;
