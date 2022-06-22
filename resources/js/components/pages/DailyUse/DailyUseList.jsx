import  './DailyUseList.scss';
import DayViewContent from './DayView/DayViewContent';
import DayViewTop from './DayView/DayViewTop';
import WeekViewPage from './WeekView/WeekViewPage';


export const DayView = () => {
  return (
    <div className='wrapper'>
      <div className='pages__container DayView__container'>
        <DayViewTop />
        <DayViewContent/>
        {/* <BottomPanel/> */}
      </div>
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
