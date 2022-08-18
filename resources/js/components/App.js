import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import Topbar from "./sections/topbar/topbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './../i18nextConf';

import Sidebar from "./sections/sidebar/Sidebar";
import DayView from './pages/DayView/DayViewContent';
import WeekView from './pages/WeekView/WeekViewPage';
import Activity from './pages/Activity/ActivityPage';
import LoadingPage from "./LoadingPage";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import SmsTemplate from "./pages/SmsTemplate/SmsTemplate";
import EmailTemplate from "./pages/EmailTemplate/EmailTemplate";
import TablePlanSetup from "./pages/TablePlanSetup/TablePlanSetup";
import Areas from "./pages/Areas/Areas";
import OpeningTimes from "./pages/OpeningTimes/OpeningTimes";
import CustomBookingLength from "./pages/CustomBookingLength/CustomBookingLength"

import BasicInformation from './pages/GeneralSettings/BasicInformation/BasicInformation';
import Pictures from './pages/GeneralSettings/Pictures/Pictures';

function App() {
  if(localStorage.getItem('token')){
    axios.get(`${process.env.APP_URL}/api/user`).then(response => {
    }).catch(error => {
      if (error.response.status === 401){
        localStorage.clear()
        window.location.href="/"
      }
    })
  }
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingPage/>}>
        <Topbar/>
        <div className="content">
          {localStorage.getItem('token') ?
            <>
              <Sidebar/>
              <div className='scroll_wrapper'>
                <Routes>
                  {/* <Route path='/dailyuse' exact element={<DailyUse/>}/> */}
                  <Route path='/DayView' exact element={<DayView/>}/>
                  <Route path='/WeekView' exact element={<WeekView/>}/>
                  <Route path='/Activity' exact element={<Activity/>}/>
                  <Route path='/TablePlanSetup' exact element={<TablePlanSetup/>}/>
                  <Route path='/Areas' exact element={<Areas/>}/>
                  <Route path='/SmsTemplates/:purpose' exact element={<SmsTemplate/>}/>
                  <Route path='/EmailTemplates/:purpose' exact element={<EmailTemplate/>}/>
                  <Route path='/OpeningTimes' exact element={<OpeningTimes/>}/>

                  <Route path='/BasicInformation' exact element={<BasicInformation/>} />
                  <Route path='/Pictures' exact element={<Pictures/>} />

                  <Route path='/CustomBookingLength' exact element={<CustomBookingLength/>}/>
                </Routes>
              </div>
            </>
            :
            <div className='scroll_wrapper'>
              <Routes>
                <Route path='/login' exact element={<Login/>}/>
                <Route path='/register' exact element={<Register/>}/>
              </Routes>
            </div>
          }
        </div>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<App />, document.getElementById('app'));
}
