import React, {useEffect, useState} from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerCustom.scss';
import Moment from "moment";
import eventBus from "../../../../../eventBus";

// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';


 const  DatePicker4 = () => {
  const [startDate, setStartDate] = useState(new Date());

   useEffect(async () => {
     if(localStorage.getItem('date')){
       setStartDate(new Date(localStorage.getItem('date')))
     }
   }, [])

   const onChange = (date) => {
     setStartDate(date)
     localStorage.setItem('date',Moment(date).format('YYYY-MM-DD'))
     eventBus.dispatch("dateChanged")
   };

  return (

    <DatePicker
      renderCustomHeader={({
        monthDate,
        customHeaderCount,
        decreaseMonth,
        increaseMonth,
      }) => (
        <div className='DataPicker__container'>
          <button
            aria-label="Previous Month"
            className={
              "react-datepicker__navigation react-datepicker__navigation--previous"
            }
            style={customHeaderCount === 1 ? { visibility: "hidden" } : null}
            onClick={decreaseMonth}
          >
            <span
              className={
                "react-datepicker__navigation-icon react-datepicker__navigation-icon--previous"
              }
            >
              {"<"}
            </span>
          </button>
          <span className="react-datepicker__current-month">
            {monthDate.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            aria-label="Next Month"
            className={
              "react-datepicker__navigation react-datepicker__navigation--next"
            }
            style={customHeaderCount === 0 ? { visibility: "hidden" } : null}
            onClick={increaseMonth}
          >
            <span
              className={
                'react-datepicker__navigation-icon react-datepicker__navigation-icon--next'
              }
            >
              {">"}
            </span>
          </button>
        </div>
      )}
      selected={startDate}
      onChange={(date) => onChange(date)}
      monthsShown={2}
    />
  );
};

export default  DatePicker4;
