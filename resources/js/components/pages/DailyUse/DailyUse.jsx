import  './DailyUse.scss';
import DayViewTop from './DayView/DayViewTop';
import DayViewContent from './DayView/DayViewContent';
import BottomPanel from './DayView/bottompanel/BottomPanel';
import WeekViewPage from './WeekView/WeekViewPage';


export const DayView = () => {
  return (<>
      <div className='pages__container DayView__container'>
        <DayViewTop />
        <DayViewContent/>
      </div>
      <BottomPanel/>
  </>);
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
