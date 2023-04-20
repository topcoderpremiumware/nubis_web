import React, { useEffect, useState, Suspense } from "react";
import "./App.css";
import MainBlock from "./components/FirstBlock/MainBlock.jsx";
import { Carousel } from "react-responsive-carousel";
import SecondBlock from "./components/SecondBlock/SecondBlock";
import { useRef } from "react";
import LastBlock from "./components/LastBlock/LastBlock";
import "./components/FourthBlock/FourthBlock.css";
import { utils } from "react-modern-calendar-datepicker";
import ReactDOM from "react-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {normalizeNumber} from "../helper"
import './../i18nextConf';
import LoadingPage from "../components/LoadingPage";
import SelectArea from "./components/SelectArea/SelectArea";
import axios from "axios";
import i18n from "i18next";
import eventBus from "../eventBus";

const App = () => {
  const ref = useRef(null);

  const [guestValue, setGuestValue] = useState(0);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = useState(utils().getToday());
  const [orderDate, setOrderDate] = useState("");
  const [dates, setDates] = useState();
  const [soldDateArray, setSoldDateArray] = useState([]);
  const [allowEmails, setAllowEmails] = useState(0);
  const [allowNews, setAllowNews] = useState(0);
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    zip_code: "",
    password: "",
    password_confirmation: "",
    allow_send_emails: allowEmails,
    allow_send_news: allowNews,
    language: localStorage.getItem('i18nextLng'),
    address: "",
    bookingid: "",
  });

  const [errorsResp, setErrorsResp] = useState({
    title: "",
    emailError: "",
    passError: "",
  });
  const [modalActive, setModalActive] = useState(false);
  const [defaultModal, setDefaultModal] = useState("email");
  const [blockType, setBlockType] = useState("mainblock");
  const [restaurantInfo, setRestaurantInfo] = useState({
    address: "",
    city: "",
    name: "",
    zip_code: "",
    country: "",
  });
  const [selectedTime, setSelectedTime] = useState("");
  const [timeline, setTimeline] = useState("");
  const [timelineId, setTimelineId] = useState(null);
  const [orderResponse, setOrderResponse] = useState();
  const [filteredOrder, setFilteredOrder] = useState();
  const [ordersError, setOrdersError] = useState(true);
  const [ordersErrorString, setOrdersErrorString] = useState();

  const [extraTime, setExtraTime] = useState({});
  const [areas, setAreas] = useState([]);
  const [showSelectAreas, setShowSelectAreas] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState({})
  const [giftCardCode, setGiftCardCode] = useState('')
  const [comment, setComment] = useState('')

  const myAxios = axios.create({
    baseURL: process.env.MIX_API_URL,
    responseType: "json",
  });

  useEffect(async () => {
    testCustomer()
    await getAreas()
    getPlaceData()
    getDatesTimeInfo(utils().getToday());
    getPaymentMethod()
  }, []);

  const handleChangeItem = () => {
    if(blockType === 'mainblock' && !showSelectAreas) {
      ref.current?.moveTo(2)
    } else {
      ref.current?.increment();
    }
  };

  const handlePrevItem = (e) => {
    e.preventDefault()
    if(blockType === 'secondblock' && !showSelectAreas) {
      ref.current?.moveTo(0)
    } else {
      ref.current?.decrement();
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Another calendar

  const handleDayChange = (date) => {
    setSelectedDay(date);
    setOrderDate(date.year + "-" + date.month + "-" + date.day);
  };

  // Date request

  const datesArray = dates?.map((date) => ({
    year: new Date(date).getFullYear(),
    month: new Date(date).getMonth(),
    day: new Date(date).getDate(),
  }));

  // New state

  const postRequest = (data, url, type) => {
    const config =
      type === "logout" || type === "edit"
        ? {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
        : {};

    myAxios.post(url,{...data}, config)
      .then((response) => {
        type === "register" && setUserData(response.data.customer);
        if (type === "register" || type === "login") {
          localStorage.setItem("token", response.data.token);
          handleChangeItem();
        }
        type === "login" && getUserInfoReq();
        if (type === "loginWait") {
          localStorage.setItem("token", response.data.token);
          getUserInfoReq();
          setDefaultModal("submit");
        }
        if (type === "loginCancel") {
          localStorage.setItem("token", response.data.token);
          setDefaultModal("canceling");
        }
        if (type === "loginMore") {
          localStorage.setItem("token", response.data.token);
          setDefaultModal("morePeople");
        }
        type === "email" && setDefaultModal("login");
        type === "emailWait" && setDefaultModal("loginWait");
        type === "emailCancel" && setDefaultModal("loginCancel");
        type === "emailMore" && setDefaultModal("loginMore");
        if (type === "logout") {
          localStorage.removeItem("token");
          window.location.reload();
        }
        if (type === "login") {
          setModalActive(false);
        }
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.errors) {
          for (const [key, value] of Object.entries(error.response.data.errors)) {
            value.forEach(v => {
              eventBus.dispatch("notification", {type: 'error', message: v});
            })
          }
        } else {
          eventBus.dispatch("notification", {type: 'error', message: error.response.data.message});
          console.error('Error', error.message,error.response.data.message)
        }
        if (type === "register" || type === "edit") {
          setErrorsResp({
            title: "Please go back and fix the errors:",
            emailError: error.response.data.errors.email,
            passError: error.response.data.errors.password,
          });
        }
        console.log("reg error", error);
        type === "email" && setDefaultModal("register");
      });
  };

  const getPaymentMethod = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${getPlaceId()}/payment_method`)
    setPaymentMethod(res.data)
  }

  // Login request

  const testCustomer = () => {
    myAxios.get("/api/customers").then((response) => {
      if(response.data.hasOwnProperty('is_superadmin')){
        logout()
      }
      console.log('testCustomer',response.data)
    }).catch((error) => {
      console.error('testCustomer',error)
    });
  }

  const getUserInfoReq = () => {
    myAxios
      .get("/api/customers", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {});
  };

  //Logout request

  const logout = () => {
    myAxios.post(
      "/api/customers/logout",
      {},
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    localStorage.removeItem("token");
  };

  // Optimized Request

  const getPlaceId = () => {
    let pathArray = window.location.pathname.split('/')
    return pathArray.length === 3 ? pathArray[2] : 0
  };

  const getDatesTimeInfo = (day) => {
    myAxios
      .get(`/api/work_dates`, {
        params: {
          place_id: getPlaceId(),
          area_id: localStorage.getItem('area_id'),
          seats: guestValue,
          from: `${day.year}-${normalizeNumber(day.month)}-01`,
          to: `${day.year}-${normalizeNumber(day.month)}-${new Date(
            day.year,
            day.month,
            0
          ).getDate()}`,
        },
      })
      .then((response) => {
          setDates(response.data);
      })
      .catch((error) => {
        console.log(`error: `, error);
      });
    myAxios
      .get(`/api/free_dates`, {
        params: {
          place_id: getPlaceId(),
          area_id: localStorage.getItem('area_id'),
          seats: guestValue,
          from: `${day.year}-${normalizeNumber(day.month)}-01`,
          to: `${day.year}-${normalizeNumber(day.month)}-${new Date(
            day.year,
            day.month,
            0
          ).getDate()}`,
        },
      })
      .then((response) => {
        const dates = response.data?.map((date) => (new Date(date).getDate()));
        setSoldDateArray(dates);
      })
      .catch((error) => {
        console.log(`error: `, error);
      });
  };

  // Make order request

  const makeOrder = (setupIntentId) => {
    return myAxios
      .post(
        "/api/make_order",
        {
          place_id: getPlaceId(),
          area_id: localStorage.getItem('area_id'),
          seats: guestValue,
          reservation_time: `${selectedDay.year}-${normalizeNumber(
            selectedDay.month
          )}-${normalizeNumber(selectedDay.day)} ${selectedTime}`,
          comment: comment,
          timezone_offset: new Date().getTimezoneOffset()*-1,
          status: defaultModal === "submit" ? "waiting" : "ordered",
          length: timeline,
          is_take_away: false,
          ...(giftCardCode && {giftcard_code: giftCardCode}),
          custom_booking_length_id: timelineId,

          ...(setupIntentId && {setup_intent_id: setupIntentId})
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      )
  };

  const getAreas = async () => {
    await axios.get(`${process.env.MIX_API_URL}/api/places/${getPlaceId()}/areas`).then(response => {
      const availableAreas = response.data.filter(i => !!i.online_available)
      setAreas(availableAreas)
      if(availableAreas.length > 1) {
        setShowSelectAreas(true)
      }
      if (availableAreas.length === 1) {
        localStorage.setItem('area_id', availableAreas[0].id)
      }
    }).catch(error => {
      console.log("Error: ", error);
    })
  }

  const getPlaceData = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${getPlaceId()}`).then(response => {
      if(!localStorage.getItem('langChanged')){
        i18n.changeLanguage(response.data.language).then(() => {
          eventBus.dispatch("langChanged")
        })
      }
      setRestaurantInfo((prev) => ({
        ...prev,
        ...response.data,
        country: response.data.country.name,
      }));
    }).catch(error => {
      console.log("Error: ", error);
    })
  }



  // Cancel order

  console.log("Orders Error: ", ordersError);

  const cancelOrder = () => {
    myAxios.delete(`/api/cancel_order/${userData?.bookingid || ""}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
  };

  const getOrders = () => {
    myAxios
      .get("/api/customers/orders", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((response) => {
        const filteredArray = response.data.filter((order) => {
          return order.id === Number(userData?.bookingid);
        });
        setOrdersError(filteredArray.length);
        if (filteredArray.length > 0) {
          setDefaultModal("confirmation");
        } else {
          setOrdersErrorString("Not found");
        }
        setFilteredOrder(filteredArray);
      })
      .catch((error) => {
        setOrdersErrorString(error.response.data.message);
        setOrdersError(false);
      });
  };

  // Getting extra time

  return (
    <Suspense fallback={<LoadingPage/>}>
      <div>
        <Carousel
          swipeable={false}
          showArrows={false}
          showStatus={false}
          showIndicators={false}
          showThumbs={false}
          autoPlay={false}
          ref={ref}
        >
          <div>
            <MainBlock
              handleChangeItem={handleChangeItem}
              guestValue={guestValue}
              setGuestValue={setGuestValue}
              getPlaceId={getPlaceId}
              blockType={blockType}
              setBlockType={setBlockType}
              defaultModal={defaultModal}
              setDefaultModal={setDefaultModal}
              modalActive={modalActive}
              setModalActive={setModalActive}
              postRequest={postRequest}
              userData={userData}
              setUserData={setUserData}
              handlePrevItem={handlePrevItem}
              selectedDate={selectedDate}
              handleDateChange={handleDateChange}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              handleDayChange={handleDayChange}
              errorsResp={errorsResp}
              selectedTime={selectedTime}
              restaurantInfo={restaurantInfo}
              getUserInfoReq={getUserInfoReq}
              makeOrder={makeOrder}
              timeline={timeline}
              setTimeline={setTimeline}
              cancelOrder={cancelOrder}
              getOrders={getOrders}
              ordersError={ordersError}
              ordersErrorString={ordersErrorString}
              filteredOrder={filteredOrder}
              getDatesTimeInfo={getDatesTimeInfo}
            />
          </div>
          <div>
            <SelectArea
              areas={areas}
              restaurantInfo={restaurantInfo}
              guestValue={guestValue}
              handleChangeItem={handleChangeItem}
              handlePrevItem={handlePrevItem}
              blockType={blockType}
              setBlockType={setBlockType}
            />
          </div>
          <div>
            <SecondBlock
              getPlaceId={getPlaceId}
              handleChangeItem={handleChangeItem}
              handlePrevItem={handlePrevItem}
              guestValue={guestValue}
              selectedDate={selectedDate}
              handleDateChange={handleDateChange}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              handleDayChange={handleDayChange}
              defaultModal={defaultModal}
              setDefaultModal={setDefaultModal}
              postRequest={postRequest}
              errorsResp={errorsResp}
              userData={userData}
              setUserData={setUserData}
              datesArray={datesArray}
              soldDateArray={soldDateArray}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              getDatesTimeInfo={getDatesTimeInfo}
              restaurantInfo={restaurantInfo}
              getUserInfoReq={getUserInfoReq}
              modalActive={modalActive}
              setModalActive={setModalActive}
              makeOrder={makeOrder}
              blockType={blockType}
              setBlockType={setBlockType}
              timeline={timeline}
              setTimeline={setTimeline}
              timelineId={timelineId}
              setTimelineId={setTimelineId}
              setExtraTime={setExtraTime}
              extraTime={extraTime}
            />
          </div>
          <div>
            <LastBlock
              handleChangeItem={handleChangeItem}
              handlePrevItem={handlePrevItem}
              guestValue={guestValue}
              orderDate={orderDate}
              logout={logout}
              postRequest={postRequest}
              errorsResp={errorsResp}
              userData={userData}
              setUserData={setUserData}
              defaultModal={defaultModal}
              setDefaultModal={setDefaultModal}
              makeOrder={makeOrder}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              selectedTime={selectedTime}
              allowEmails={allowEmails}
              setAllowEmails={setAllowEmails}
              allowNews={allowNews}
              setAllowNews={setAllowNews}
              restaurantInfo={restaurantInfo}
              blockType={blockType}
              setBlockType={setBlockType}
              orderResponse={orderResponse}
              setOrderResponse={setOrderResponse}
              paymentMethod={paymentMethod}
              giftCardCode={giftCardCode}
              setGiftCardCode={setGiftCardCode}
              comment={comment}
              setComment={setComment}
            />
          </div>
        </Carousel>
      </div>
    </Suspense>
  );
};

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<App />, document.getElementById('app'));
}
