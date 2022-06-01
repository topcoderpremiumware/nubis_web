import  './DailyUseList.scss';
import DayViewPage from './DayView/DayViewPage';
import DayViewTop from './DayView/DayViewTop';
import WeekViewPage from './WeekView/WeekViewPage';


// export const DailyUse = () => {
//   return (
//     <div className='pages__container'>
//       <h1>DailyUse</h1>
//     </div>
//   );
// };

export const DayView = () => {
  return (
    <div className='pages__container'>
      {/* <h1>DayView</h1> */}
      <DayViewTop/>
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
