import React, { Suspense, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Topbar from "./sections/topbar/topbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './../i18nextConf';

import Sidebar from "./sections/sidebar/Sidebar";
import LoadingPage from "./LoadingPage";
import Banner from './sections/banner/Banner';

const DayView = React.lazy(() => import('./pages/DayView/DayViewContent'))
const Login = React.lazy(() => import('./pages/Login/Login'))
const Register = React.lazy(() => import('./pages/Register/Register'))
const SmsTemplate = React.lazy(() => import('./pages/SmsTemplate/SmsTemplate'))
const SmsApiKeys = React.lazy(() => import('./pages/GeneralSettings/SmsApiKeys/SmsApiKeys'))
const EmailTemplate = React.lazy(() => import('./pages/EmailTemplate/EmailTemplate'))
const TablePlanSetup = React.lazy(() => import('./pages/TablePlanSetup/TablePlanSetup'))
const Areas = React.lazy(() => import('./pages/Areas/Areas'))
const ManageFeedback = React.lazy(() => import('./pages/ManageFeedback/ManageFeedback'))
const OpeningTimes = React.lazy(() => import('./pages/OpeningTimes/OpeningTimes'))
const CustomBookingLength = React.lazy(() => import('./pages/CustomBookingLength/CustomBookingLength'))
const BasicInformation = React.lazy(() => import('./pages/GeneralSettings/BasicInformation/BasicInformation'))
const BookingSettings = React.lazy(() => import('./pages/GeneralSettings/BookingSettings/BookingSettings'))
const Pricing = React.lazy(() => import('./pages/Pricing/Pricing'))
const RestaurantNew = React.lazy(() => import('./pages/RestaurantNew/RestaurantNew'))
const ThankYou = React.lazy(() => import('./pages/ThankYou/ThankYou'))
const ManageGiftCards = React.lazy(() => import('./pages/ManageGiftCards/ManageGiftCards'))
const BookingLinkGuide = React.lazy(() => import('./pages/BookingLinkGuide/BookingLinkGuide'))
const NotificationsSettings = React.lazy(() => import('./pages/GeneralSettings/NotificationsSettings/NotificationsSettings'))
const Support = React.lazy(() => import('./pages/Support/Support'))
const PaymentGateway = React.lazy(() => import('./pages/GuestPayment/PaymentGateway/PaymentGateway'))
const PaymentSettings = React.lazy(() => import('./pages/GuestPayment/PaymentSettings/PaymentSettings'))
const VideoGuideSettings = React.lazy(() => import('./pages/VideoGuideSettings/VideoGuideSettings'))
const MonthView = React.lazy(() => import('./pages/MonthView/MonthView'))
const SendBulkSMS = React.lazy(() => import('./pages/SendBulkSMS/SendBulkSMS'))
const VideoGuides = React.lazy(() => import('./pages/VideoGuides/VideoGuides'))
const BillingReport = React.lazy(() => import('./pages/BillingReport/BillingReport'))
const Roles = React.lazy(() => import('./pages/Roles/Roles'))
const Welcome = React.lazy(() => import('./pages/Welcome/Welcome'))
const SmsPricing = React.lazy(() => import('./pages/SmsPricing/SmsPricing'))
const Forgot = React.lazy(() => import('./pages/Forgot/Forgot'))
const PasswordReset = React.lazy(() => import('./pages/PasswordReset/PasswordReset'))
const GeneralSettings = React.lazy(() => import('./pages/GiftcardSettings/GeneralSettings/GeneralSettings'))
const ExperienceSettings = React.lazy(() => import('./pages/GiftcardSettings/ExperienceSettings/ExperienceSettings'))
const Receipts = React.lazy(() => import('./pages/Receipts/Receipts'))
const Receipt = React.lazy(() => import('./pages/Receipts/Receipt'))
const POSReport = React.lazy(() => import('./pages/Receipts/Report'))
const SignSettings = React.lazy(() => import('./pages/Receipts/SignSettings'))
const TerminalSettings = React.lazy(() => import('./pages/Receipts/Terminals/Terminals'))
const QZSettings = React.lazy(() => import('./pages/Receipts/QZSettings'))
const PricingNew = React.lazy(() => import('./pages/Pricing/PricingNew'))
const PosPage = React.lazy(() => import('./pages/Receipts/PosPage'))

import eventBus from '../eventBus';

function App() {
  const [sidebarIsVisible, setSidebarIsVisible] = useState(true)

  if(localStorage.getItem('token')){
    axios.get(`${process.env.MIX_API_URL}/api/user`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      window.is_superadmin = response.data.is_superadmin
      window.user_id = response.data.id
      console.log('is_superadmin',window.is_superadmin)
    }).catch(error => {
      if (error.response.status === 401){
        let lang = localStorage.getItem('i18nextLng')
        let qz_cert = localStorage.getItem('qz_cert')
        let qz_key = localStorage.getItem('qz_key')
        localStorage.clear()
        localStorage.setItem('i18nextLng', lang)
        localStorage.setItem('qz_cert', qz_cert)
        localStorage.setItem('qz_key', qz_key)
        window.location.href="/admin/login"
      }
    })
  }

  useEffect(() => {
    getRole()
    getBills()
    function toggleSidebar(){
      setSidebarIsVisible(prev => !prev)
    }
    function placeChanged(){
      getRole()
      getBills()
    }
    function updateBills(callback){
      getBills(callback)
    }
    eventBus.on('updateBills', updateBills)
    eventBus.on('toggleSidebar', toggleSidebar)
    eventBus.on("placeChanged",  placeChanged)

    return () => {
      eventBus.remove('updateBills', updateBills)
      eventBus.remove('toggleSidebar', toggleSidebar)
      eventBus.remove("placeChanged",  placeChanged)
    }
  }, [])

  const getRole = () => {
    axios.get(`${process.env.MIX_API_URL}/api/user/role`,{
      params: {
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      if(response.data.length > 0){
        window.role = response.data[0].title
      }else{
        window.role = ''
      }
      eventBus.dispatch('roleChanged')
    }).catch(error => {
      console.log('role error',error.response)
    })
  }

  const getBills = (callback = null) => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/active_billings`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      window.bills = response.data
      eventBus.dispatch('roleChanged')
      if(callback) callback()
    }).catch(error => {
      console.log('bills error',error.response)
    })
  }

  return (
    <BrowserRouter basename="/admin">
      <Suspense fallback={<LoadingPage/>}>
        <Topbar/>
        {localStorage.getItem('token') ?
          <div className={`content content-responsive ${sidebarIsVisible ? 'active' : ''}`}>
            <Sidebar sidebarIsVisible={sidebarIsVisible}/>
            <div className='scroll_wrapper'>
              <Banner />
              <Routes>
                <Route path='/' exact element={<Suspense fallback={<LoadingPage/>}>
                  <Welcome/>
                </Suspense>}/>
                <Route path='/DayView' exact element={<Suspense fallback={<LoadingPage/>}>
                  <DayView/>
                </Suspense>}/>
                <Route path='/MonthView' exact element={<Suspense fallback={<LoadingPage/>}>
                  <MonthView/>
                </Suspense>}/>
                <Route path='/TablePlanSetup' exact element={<Suspense fallback={<LoadingPage/>}>
                  <TablePlanSetup/>
                </Suspense>}/>
                <Route path='/Areas' exact element={<Suspense fallback={<LoadingPage/>}>
                  <Areas/>
                </Suspense>}/>
                <Route path='/ManageFeedback' exact element={<Suspense fallback={<LoadingPage/>}>
                  <ManageFeedback/>
                </Suspense>}/>
                <Route path='/SmsTemplates/:purpose' exact element={<Suspense fallback={<LoadingPage/>}>
                  <SmsTemplate/>
                </Suspense>}/>
                <Route path='/EmailTemplates/:purpose' exact element={<Suspense fallback={<LoadingPage/>}>
                  <EmailTemplate/>
                </Suspense>}/>
                <Route path='/OpeningTimes' exact element={<Suspense fallback={<LoadingPage/>}>
                  <OpeningTimes/>
                </Suspense>}/>
                <Route path='/ManageGiftCards' exact element={<Suspense fallback={<LoadingPage/>}>
                  <ManageGiftCards/>
                </Suspense>}/>

                <Route path='/BasicInformation' exact element={<Suspense fallback={<LoadingPage/>}>
                  <BasicInformation/>
                </Suspense>} />
                <Route path='/BookingSettings' exact element={<Suspense fallback={<LoadingPage/>}>
                  <BookingSettings/>
                </Suspense>} />
                <Route path='/GiftcardSettings' exact element={<Suspense fallback={<LoadingPage/>}>
                  <GeneralSettings/>
                </Suspense>} />
                <Route path='/ExperienceSettings' exact element={<Suspense fallback={<LoadingPage/>}>
                  <ExperienceSettings/>
                </Suspense>} />
                <Route path='/SmsKeys' exact element={<Suspense fallback={<LoadingPage/>}>
                  <SmsApiKeys/>
                </Suspense>}/>
                <Route path='/PaymentGateway' exact element={<Suspense fallback={<LoadingPage/>}>
                  <PaymentGateway/>
                </Suspense>}/>
                <Route path='/NotificationsSettings' exact element={<Suspense fallback={<LoadingPage/>}>
                  <NotificationsSettings/>
                </Suspense>}/>
                <Route path='/PaymentSettings' exact element={<Suspense fallback={<LoadingPage/>}>
                  <PaymentSettings/>
                </Suspense>}/>
                <Route path='/VideoGuideSettings' exact element={<Suspense fallback={<LoadingPage/>}>
                  <VideoGuideSettings/>
                </Suspense>}/>

                <Route path='/VideoGuides' exact element={<Suspense fallback={<LoadingPage/>}>
                  <VideoGuides/>
                </Suspense>}/>

                <Route path='/CustomBookingLength' exact element={<Suspense fallback={<LoadingPage/>}>
                  <CustomBookingLength/>
                </Suspense>}/>
                <Route path='/BookingLinkGuide' exact element={<Suspense fallback={<LoadingPage/>}>
                  <BookingLinkGuide/>
                </Suspense>}/>

                <Route path='/POS' exact element={<Suspense fallback={<LoadingPage/>}>
                  <PosPage/>
                </Suspense>}/>
                <Route path='/Receipts' exact element={<Suspense fallback={<LoadingPage/>}>
                  <Receipts/>
                </Suspense>}/>
                <Route path='/Receipts/:id' exact element={<Suspense fallback={<LoadingPage/>}>
                  <Receipt/>
                </Suspense>}/>
                <Route path='/POSReport' exact element={<Suspense fallback={<LoadingPage/>}>
                  <POSReport/>
                </Suspense>}/>
                <Route path='/SignSettings' exact element={<Suspense fallback={<LoadingPage/>}>
                  <SignSettings/>
                </Suspense>}/>
                <Route path='/QZSettings' exact element={<Suspense fallback={<LoadingPage/>}>
                  <QZSettings/>
                </Suspense>}/>
                <Route path='/TerminalSettings' exact element={<Suspense fallback={<LoadingPage/>}>
                  <TerminalSettings/>
                </Suspense>}/>

                <Route path='/pricing' exact element={<Suspense fallback={<LoadingPage/>}>
                  <Pricing/>
                </Suspense>}/>
                <Route path='/pricing-new' exact element={<Suspense fallback={<LoadingPage/>}>
                  <PricingNew/>
                </Suspense>}/>
                <Route path='/billingReport' exact element={<Suspense fallback={<LoadingPage/>}>
                  <BillingReport/>
                </Suspense>}/>
                <Route path='/smsPricing' exact element={<Suspense fallback={<LoadingPage/>}>
                  <SmsPricing/>
                </Suspense>}/>

                <Route path='/RestaurantNew' exact element={<Suspense fallback={<LoadingPage/>}>
                  <RestaurantNew/>
                </Suspense>}/>

                <Route path='/ThankYou' exact element={<Suspense fallback={<LoadingPage/>}>
                  <ThankYou/>
                </Suspense>}/>

                <Route path='/Support' exact element={<Suspense fallback={<LoadingPage/>}>
                  <Support/>
                </Suspense>}/>
                <Route path='/SendBulkSMS' exact element={<Suspense fallback={<LoadingPage/>}>
                  <SendBulkSMS/>
                </Suspense>}/>
                <Route path='/Roles' exact element={<Suspense fallback={<LoadingPage/>}>
                  <Roles/>
                </Suspense>}/>
              </Routes>
            </div>
          </div>
          :
          <div className="content">
            <div className='scroll_wrapper'>
              <Routes>
                <Route path='/login' exact element={<Suspense fallback={<LoadingPage/>}>
                  <Login/>
                </Suspense>}/>
                <Route path='/register' exact element={<Suspense fallback={<LoadingPage/>}>
                  <Register/>
                </Suspense>}/>
                <Route path='/forgot' exact element={<Suspense fallback={<LoadingPage/>}>
                  <Forgot/>
                </Suspense>}/>
                <Route path='/password_reset' exact element={<Suspense fallback={<LoadingPage/>}>
                  <PasswordReset/>
                </Suspense>}/>
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
