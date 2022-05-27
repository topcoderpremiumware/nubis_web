import  './DailyUse.scss';
import DayViewPage from './DayView/DayViewPage';
import WeekViewPage from './WeekView/WeekViewPage';
// import { Link } from "react-router-dom";

// export default function DailyUseList() {
//   return (
//     <div className='daily-use pages__container'>
//       {/* <DailyUse /> */}
//     </div>
//   )
// }

export const DailyUse = () => {
  return (
    <div className='pages__container'>
      <h1>DailyUse</h1>
    </div>
  );
};

export const DayView = () => {
  return (
    <div className='pages__container'>
      <h1>DayView</h1>
      <DayViewPage/>
    </div>
  );
};

export const WeekView = () => {
  return (
    <div className='pages__container'>
      <h1>WeekView</h1>
      <WeekViewPage/>
    </div>
  );
};
export const Activity = () => {
  return (
    <div className='pages__container'>
      <h1>Activity</h1>
      <WeekViewPage/>
    </div>
  );
};
