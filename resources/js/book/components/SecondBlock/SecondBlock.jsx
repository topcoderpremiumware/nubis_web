import React, { useEffect, useState } from "react";
import Image from "../FirstBlock/img/Image";
import "./SecondBlock.css";
import SelectLang from "../FirstBlock/SelectLang/SelectLang";
import Copyrigth from "../FirstBlock/Copyrigth/Copyrigth";
import Time from "./Calendar/Time";
import MainModal from "../MainModal/MainModal";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { Calendar } from "react-modern-calendar-datepicker";
import WaitingModal from "./WaitingModal/WaitingModal";
import { normalizeNumber } from "../../../helper"
import eventBus from "../../../eventBus";
import { Trans, useTranslation } from "react-i18next";
import SelectRestaurantModal from "./SelectRestaurantModal/SelectRestaurantModal";
import moment from "moment";

function SecondBlock(props) {
  const { t } = useTranslation();
  const {
    restaurantInfo,
    datesArray,
    soldDateArray,
    selectedDay,
    setSelectedDay,
    setModalActive,
    modalActive,
    timeline,
    setTimeline,
    timelineId,
    setTimelineId,
  } = props;

  const [alternativeRestaurants, setAlternativeRestaurants] = useState([])
  const [extraTimeReq, setExtraTimeReq] = useState([]);
  const [times, setTimes] = useState([]);

  useEffect(async () => {
    if(props.blockType === 'secondblock') {
      getExtraTime(selectedDay)
      getAlternativeRestaurants()
      eventBus.on("langChanged", () => {
        getExtraTime(selectedDay)
      })
    }
  }, [props.blockType]);

  useEffect(async () => {
    if(extraTimeReq.length > 0){
      setTimelineType(extraTimeReq[0])
    }
  }, [extraTimeReq]);



  // useEffect(() => {
  //   if ((!extraTimeReq?.length && !times?.length) && props.defaultModal !== "waiting") {
  //     props.setDefaultModal("noTime");
  //     setModalActive(true)
  //   } else {
  //     // props.setDefaultModal("");
  //     // setModalActive(false)
  //   }
  // }, [times, extraTimeReq])

  const setTimelineType = (type) => {
    setTimeline(type.length);
    console.log('setTimelineId', type)
    setTimelineId(type.id)
    const extraTimesArray = (timereq) =>
      extraTimeReq
        .filter((oneBlock) => oneBlock.length === timereq)[0]
        .time.map((time) => ({
          time: moment.utc(time).format('HH:mm:ss'),
          active: true,
          shortTime: moment.utc(time).local().format('HH:mm'),
        }));
    console.log("Times array Extra: ", extraTimesArray(type.length));
    // const setExtraTimes = ;
    setTimes(extraTimesArray(type.length));
  };

  const newDateArray = datesArray?.map((one) => one.day);

  const getDisabledDays = () => {
    const disabledDates = [];
    for (let i = 1; i <= 31; i++) {
      if (!newDateArray?.includes(i)) {
        disabledDates.push({
          year: selectedDay.year,
          month: selectedDay.month,
          day: i,
        });
      }
    }
    return disabledDates;
  }

  const getSoldDays = () => {
    const soldDates = [];
    console.log('getSoldDays',newDateArray,soldDateArray)
    for (let i = 1; i <= 31; i++) {
      if (newDateArray?.includes(i) && !soldDateArray?.includes(i)) {
        soldDates.push({
          year: selectedDay.year,
          month: selectedDay.month,
          day: i,
          className: 'soldDay'
        })
      }
    }
    return soldDates
  }

  const getAlternativeRestaurants = async () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${props.getPlaceId()}/alternative`)
      .then((response) => {
        setAlternativeRestaurants(response.data)
      })
      .catch((error) => {
        console.log("Alternative restaurants error: ", error);
      });
  }

  const getExtraTime = (date) => {
    axios.get(`${process.env.MIX_API_URL}/api/custom_booking_lengths`, {
      params: {
        place_id: props.getPlaceId(),
        area_id: localStorage.getItem('area_id'),
        seats: props.guestValue,
        reservation_date: `${date.year}-${normalizeNumber(date.month)}-${normalizeNumber(date.day)}`,
        language: localStorage.getItem('i18nextLng')
      },
    })
      .then((response) => {
        console.log('getExtraTime',response.data)
        setExtraTimeReq(response.data);

        if (response.data.length === 0) {
          getTime(date)
        }
      })
      .catch((error) => {
        console.log("Extra time error: ", error);
      });
  }

  const getTime = (date) => {
    axios.get(`${process.env.MIX_API_URL}/api/free_time`, {
      params: {
        place_id: props.getPlaceId(),
        area_id: localStorage.getItem('area_id'),
        seats: props.guestValue,
        date: `${date.year}-${normalizeNumber(date.month)}-${normalizeNumber(date.day)}`,
      },
    })
      .then((response) => {
        if(response.data.free_time.length) {
          const timesArray = response.data?.free_time?.map((time) => ({
            time: moment.utc(time).format('HH:mm:ss'),
            shortTime: moment.utc(time).local().format('HH:mm'),
          }));
          console.log('timesArray', timesArray)
          setTimes(timesArray);
        } else {
          props.setDefaultModal("noTime");
          setModalActive(true)
        }
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  }

  const setCalendarValue = (date) => {
    console.log('setCalendarValue', date)
    setSelectedDay(date);
    getExtraTime(date);
  };

  const setMonthUp = () => {
    let tempDay = { ...selectedDay };
    if (selectedDay.month > 11) {
      tempDay = { ...tempDay, month: 1, year: tempDay.year + 1 };
    } else {
      tempDay = { ...tempDay, month: tempDay.month + 1 };
    }
    setSelectedDay(tempDay);
    props.getDatesTimeInfo(tempDay);
  };

  const setMonthDown = () => {
    let tempDay = { ...selectedDay };
    if (selectedDay.month < 2) {
      tempDay = { ...tempDay, month: 12, year: tempDay.year - 1 };
    } else {
      tempDay = { ...tempDay, month: tempDay.month - 1 };
    }
    setSelectedDay(tempDay);
    props.getDatesTimeInfo(tempDay);
  };

  const showModalWindow = (e) => {
    e.preventDefault();
    props.setDefaultModal("waiting");
    setModalActive(true);
    getExtraTime(selectedDay);
  }

  const checkToken = () => {
    console.log('next button pressed on SecondBlock (Calendar)')
    console.log('selectedTime', props.selectedTime)
    if (props.selectedTime) {
      if (localStorage.getItem("token")) {
        console.log('next button pressed has auth')
        props.getUserInfoReq();
        props.handleChangeItem();
      } else {
        console.log('next button pressed has no auth')
        setModalActive(true);
        props.setDefaultModal("email");
      }
      props.setBlockType("lastblock");
    }
  }

  const getTitle = {
    noTime: t("We don't have empty table for you"),
    waiting: t('Please select a waiting list'),
    agreements: t('Confirm waiting list conditions'),
    submit: t('You are about to be added to the waiting list'),
    ordered: <Trans>Thanks {{ name: props.userData.first_name }} - you have been added to the waiting list</Trans>,
  };

  return (
    <div className="content">
      <Image />
      <div className="content-wrapper">
        <div className="main-block__body">
          <div className="nav">
            <div className="back">
              <a href="/#" className="back-link" onClick={(e) => props.handlePrevItem(e)}>
                ← {t('Back')}
              </a>
            </div>
            <div className="second-step__lang">
              <SelectLang />
            </div>
          </div>
          <div className="overhead second-overhead">
            <Trans>Reserved {{ val: props.guestValue }} Guests</Trans>
          </div>
          <div className="title second-title">{t('Select Date And Time')}</div>
          <div className="second-block__datepicker">
            <div className="calendar-arrows">
              <button className="arrows">
                <span onClick={setMonthDown}>←</span>
              </button>
              <button className="arrows">
                <span onClick={setMonthUp}> → </span>
              </button>
            </div>
            <Calendar
              value={selectedDay}
              onChange={(day) => setCalendarValue(day)}
              shouldHighlightWeekends
              disabledDays={getDisabledDays()}
              customDaysClassName={getSoldDays()}
            />
          </div>
          {/*{props.blockType === "secondblock" && (*/}
            <div>
              {console.log('extraTimeReq', extraTimeReq)}
              {extraTimeReq.length > 0 ? extraTimeReq.map((blockTime, key) => (
                <div className="select-time" key={key}>
                  <div className="select-time-wrapper" onClick={() => setTimelineType(blockTime)}>
                    {blockTime?.image && <img src={blockTime.image} alt="" />}
                    <div>
                      <p className="select-time-title">{blockTime.name}</p>
                      {blockTime.description}
                    </div>
                  </div>
                  {(timelineId === blockTime.id && timeline === blockTime.length) &&
                    <Time setSelectedTime={props.setSelectedTime} times={times} />
                  }
                </div>
              )) :
                <div className="select-time">
                  <div>
                    <p className="select-time-title">{t('Select time')}</p>
                  </div>
                  <Time setSelectedTime={props.setSelectedTime} times={times} />
                </div>
              }
            </div>
          {/*)}*/}
          <div
            className="button-main next-button"
            onClick={checkToken}
          >
            {t('Next')} →
          </div>
          <div className="footer">
            <p className="subtitle">{t('Cannot find a suitable time?')}</p>
            <button
              href="/#"
              className="waiting-list"
              onClick={(e) => showModalWindow(e)}
            >
              {t('Add me to the waiting list')}
            </button>
            <Copyrigth restaurantInfo={restaurantInfo} />
          </div>
        </div>
      </div>
      {(props.defaultModal === "email" ||
        props.defaultModal === "emailWait") && (
          <MainModal
            title={t('Please enter your email to continue')}
            active={modalActive}
            setActive={setModalActive}
            mainProps={props.mainProps}
            callback={props.postRequest}
            defaultModal={props.defaultModal}
            userData={props.userData}
            setUserData={props.setUserData}
          />
        )}
      {(props.defaultModal === "login" ||
        props.defaultModal === "loginWait") && (
          <MainModal
            title={t('Please enter your email and password to continue')}
            active={modalActive}
            setActive={setModalActive}
            callback={props.postRequest}
            defaultModal={props.defaultModal}
            mainProps={props.mainProps}
            userData={props.userData}
            setUserData={props.setUserData}
          />
        )}
      {props.defaultModal === "register" && (
        <MainModal
          title={t('Enter your contact details')}
          active={modalActive}
          setActive={setModalActive}
          callback={props.postRequest}
          errorsResp={props.errorsResp}
          defaultModal={props.defaultModal}
          mainProps={props.mainProps}
          userData={props.userData}
          setUserData={props.setUserData}
        />
      )}
      {(props.defaultModal === "waiting" ||
        props.defaultModal === "noTime" ||
        props.defaultModal === "agreements" ||
        props.defaultModal === "submit" ||
        props.defaultModal === "ordered") && (
          <WaitingModal
            title={getTitle[props.defaultModal] || ""}
            active={modalActive}
            setActive={setModalActive}
            callback={props.postRequest}
            errorsResp={props.errorsResp}
            defaultModal={props.defaultModal}
            mainProps={props.mainProps}
            userData={props.userData}
            setUserData={props.setUserData}
            selectedDay={selectedDay}
            makeOrder={props.makeOrder}
            selectedTime={props.selectedTime}
            setSelectedTime={props.setSelectedTime}
            setDefaultModal={props.setDefaultModal}
            restaurantInfo={props.restaurantInfo}
            guestValue={props.guestValue}
            getUserInfoReq={props.getUserInfoReq}
            setModalActive={setModalActive}
            timeline={timeline}
            extraTimeReq={extraTimeReq}
            getPlaceId={props.getPlaceId}
            alternativeRestaurants={alternativeRestaurants}
          />
        )}
      {(props.defaultModal === "alternative") && (
        <SelectRestaurantModal
          data={alternativeRestaurants}
          active={modalActive}
          setActive={setModalActive}
        />
      )}
    </div>
  );
}

export default SecondBlock;
