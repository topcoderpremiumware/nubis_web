import React from 'react';
import AreasSelect from './select/AreasSelect';
import TimeSelect from './select/time-select';
import DatePicker from './datepicker/DatePicker';
import TimePlan from './TimeTablePopper/timeplan/TimePlan';
import TablePlan from './TimeTablePopper/tableplan/TablePlan';
import  './DayViewTop.scss';
import  './TimeTablePopper/TimeTablePopper.scss';


// import ToggleButton from '@mui/material/ToggleButton';
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function DayViewTop() {

  // const [alignment, setAlignment] = React.useState('web');

  // const handleChange = (event, newAlignment) => {
  //   setAlignment(newAlignment);
  // };

  return (
    <div className='DayViewTop__container'>
      <AreasSelect/>
      <TimeSelect/>
      <DatePicker/>
      <div className='TimeTablePopper__container'>
        <TimePlan/>
        <TablePlan/>
        {/* <ToggleButtonGroup
          color="primary"
          value={alignment}
          exclusive
          onChange={handleChange}
        >
          <ToggleButton value="web" ><TimePlan/></ToggleButton>
          <ToggleButton value="android"><TablePlan/></ToggleButton>
        </ToggleButtonGroup> */}
      </div>
    </div>
  )
}
