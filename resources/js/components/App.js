import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Topbar from "./sections/topbar/topbar";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import MonthView from './pages/MonthView/MonthView';
import SendBulkSMS from "./pages/SendBulkSMS/SendBulkSMS";
import VideoGuides from './pages/VideoGuides/VideoGuides';
import Banner from './sections/banner/Banner';
import eventBus from '../eventBus';
import { useState } from 'react';
import BillingReport from "./pages/BillingReport/BillingReport";
import Roles from "./pages/Roles/Roles";

function App() {
  const [sidebarIsVisible, setSidebarIsVisible] = useState(false)

  if(localStorage.getItem('token')){
    axios.get(`${process.env.MIX_API_URL}/api/user`).then(response => {
      window.is_superadmin = response.data.is_superadmin
      console.log('is_superadmin',window.is_superadmin)
    }).catch(error => {
      if (error.response.status === 401){
        localStorage.clear()
        window.location.href="/"
      }
    })
  }

  useEffect(() => {
    eventBus.on('toggleSidebar', () => {
      setSidebarIsVisible(prev => !prev)
    })
    getRole()
    eventBus.on("placeChanged",  () => {
      getRole()
    })
  }, [])

  const getRole = () => {
    axios.get(`${process.env.MIX_API_URL}/api/user/role`,{
      params: {
        place_id: localStorage.getItem('place_id')
      }
    }).then(response => {
      if(response.data.length > 0){
        window.role = response.data[0].title
      }else{
        window.role = ''
      }
      eventBus.dispatch('roleChanged')
      console.log('role',window.role)
    }).catch(error => {
      console.log('role error',error.response)
    })
  }

  return (
    <BrowserRouter basename="/admin">
      <Suspense fallback={<LoadingPage/>}>
        <Topbar/>
        {localStorage.getItem('token') ?
          <div className={sidebarIsVisible ? "content content-responsive active" : "content content-responsive"}>
            <Sidebar/>
            <div className='scroll_wrapper'>
              <Banner />
              <Routes>
                {/* <Route path='/dailyuse' exact element={<DailyUse/>}/> */}
                <Route path='/DayView' exact element={<DayView/>}/>
                <Route path='/WeekView' exact element={<WeekView/>}/>
                <Route path='/MonthView' exact element={<MonthView/>}/>
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

                <Route path='/VideoGuides' exact element={<VideoGuides/>}/>

                <Route path='/CustomBookingLength' exact element={<CustomBookingLength/>}/>
                <Route path='/BookingLinkGuide' exact element={<BookingLinkGuide/>}/>

                <Route path='/pricing' exact element={<Pricing/>}/>
                <Route path='/billingReport' exact element={<BillingReport/>}/>

                <Route path='/RestaurantNew' exact element={<RestaurantNew/>}/>

                <Route path='/ThankYou' exact element={<ThankYou/>}/>

                <Route path='/Support' exact element={<Support/>}/>
                <Route path='/SendBulkSMS' exact element={<SendBulkSMS/>}/>
                <Route path='/Roles' exact element={<Roles/>}/>
              </Routes>
            </div>
          </div>
          :
          <div className="content">
            <div className='scroll_wrapper'>
              <Routes>
                <Route path='/login' exact element={<Login/>}/>
                <Route path='/register' exact element={<Register/>}/>
              </Routes>
            </div>
          </div>
        }
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<App />, document.getElementById('app'));
}
