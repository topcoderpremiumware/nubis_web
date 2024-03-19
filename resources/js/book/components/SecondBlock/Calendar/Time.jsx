import React, {useEffect} from "react";
import "./Time.css";
import Arrow from "../Calendar/vector.jpg";
import ArrowLeft from "../Calendar/vectorleft.png";
import { useState } from "react";
import { Children } from "react";
import eventBus from "../../../../eventBus";

function Time(props) {
  const [activeButton, setActiveButton] = useState(null);

  const sliderRef = React.createRef();

  useEffect(() => {
    eventBus.on("changeTimeButton",function({indentif}){
      if(indentif !== props.indentif) setActiveButton(null)
    })
  },[])

  const buttonRight = () => {
    sliderRef.current.scrollLeft += 200
  };
  const buttonLeft = () => {
    sliderRef.current.scrollLeft -= 200
  };

  const changeActiveButton = (i) => {
    if(props.hasOwnProperty('indentif')){
      eventBus.dispatch("changeTimeButton",{indentif: props.indentif})
    }
    setActiveButton(i)
  }

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
                      changeActiveButton(i), props.setSelectedTime(oneTime.time), (props.hasOwnProperty('setTimelineType') && props.setTimelineType())
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
