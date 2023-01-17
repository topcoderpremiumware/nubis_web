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
import SmsApiKeys from './pages/GeneralSettings/SmsApiKeys/SmsApiKeys';
import EmailTemplate from "./pages/EmailTemplate/EmailTemplate";
import TablePlanSetup from "./pages/TablePlanSetup/TablePlanSetup";
import Areas from "./pages/Areas/Areas";
import ManageFeedback from "./pages/ManageFeedback/ManageFeedback";
import OpeningTimes from "./pages/OpeningTimes/OpeningTimes";
import CustomBookingLength from "./pages/CustomBookingLength/CustomBookingLength"

import BasicInformation from './pages/GeneralSettings/BasicInformation/BasicInformation';
import Pictures from './pages/GeneralSettings/Pictures/Pictures';
import Pricing from './pages/Pricing/Pricing';
import RestaurantNew from './pages/RestaurantNew/RestaurantNew';
import ThankYou from './pages/ThankYou/ThankYou';
import ManageGiftCards from './pages/ManageGiftCards/ManageGiftCards';
import BookingLinkGuide from './pages/BookingLinkGuide/BookingLinkGuide';
import NotificationsSettings from './pages/GeneralSettings/NotificationsSettings/NotificationsSettings';
import Support from './pages/Support/Support';
import PaymentGateway from './pages/GuestPayment/PaymentGateway/PaymentGateway';
import PaymentSettings from './pages/GuestPayment/PaymentSettings/PaymentSettings';
import VideoGuideSettings from './pages/VideoGuideSettings/VideoGuideSettings';
import VideoGuides from './pages/VideoGuides/VideoGuides';

function App() {
  if(localStorage.getItem('token')){
    axios.get(`${process.env.MIX_API_URL}/api/user`).then(response => {
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
                  <Route path='/ManageFeedback' exact element={<ManageFeedback/>}/>
                  <Route path='/SmsTemplates/:purpose' exact element={<SmsTemplate/>}/>
                  <Route path='/EmailTemplates/:purpose' exact element={<EmailTemplate/>}/>
                  <Route path='/OpeningTimes' exact element={<OpeningTimes/>}/>
                  <Route path='/ManageGiftCards' exact element={<ManageGiftCards/>}/>

                  <Route path='/BasicInformation' exact element={<BasicInformation/>} />
                  <Route path='/Pictures' exact element={<Pictures/>} />
                  <Route path='/SmsKeys' exact element={<SmsApiKeys/>}/>
                  <Route path='/PaymentGateway' exact element={<PaymentGateway/>}/>
                  <Route path='/NotificationsSettings' exact element={<NotificationsSettings/>}/>
                  <Route path='/PaymentSettings' exact element={<PaymentSettings/>}/>
                  <Route path='/VideoGuideSettings' exact element={<VideoGuideSettings/>}/>

                  <Route path='/CustomBookingLength' exact element={<CustomBookingLength/>}/>
                  <Route path='/BookingLinkGuide' exact element={<BookingLinkGuide/>}/>

                  <Route path='/pricing' exact element={<Pricing/>}/>

                  <Route path='/RestaurantNew' exact element={<RestaurantNew/>}/>

                  <Route path='/ThankYou' exact element={<ThankYou/>}/>

                  <Route path='/VideoGuides' exact element={<VideoGuides/>}/>

                  <Route path='/Support' exact element={<Support/>}/>
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
