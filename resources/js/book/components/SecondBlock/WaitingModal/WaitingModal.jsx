import Time from "../Calendar/Time";
import "./WaitingModal.css";
import {Trans, useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {normalizeNumber} from "../../../../helper";
import eventBus from "../../../../eventBus";
import moment from "moment/moment";

export default function WaitingModal(props) {
  const { t } = useTranslation();
  const dispErrors = props.errorsResp;
  const [modalActive, setModalActive] = useState(false);
  const [times, setTimes] = useState([]);
  const {
    title,
    defaultModal,
    setDefaultModal,
    setActive,
    selectedDay,
    restaurantInfo,
    selectedTime,
  } = props;

  useEffect(async () => {
    getTime()
  }, []);

  const setType = () => {
    if (defaultModal === "waiting") {
      props.setDefaultModal("agreements");
    }
    if (defaultModal === "agreements" && localStorage.getItem("token")) {
      setDefaultModal("submit");
      props.getUserInfoReq();
    } else if (defaultModal === "agreements") {
      setDefaultModal("emailWait");
    }else if(defaultModal === "noTime"){
      props.setDefaultModal("waiting");
    }
  };

  const getTime = () => {
    axios.get(`${process.env.MIX_API_URL}/api/work_time`, {
      params: {
        place_id: props.getPlaceId(),
        area_id: localStorage.getItem('area_id'),
        seats: props.guestValue,
        date: `${selectedDay.year}-${normalizeNumber(selectedDay.month)}-${normalizeNumber(selectedDay.day)}`,
      },
    })
      .then((response) => {
        const timesArray = response.data?.map((time) => ({
          time: moment.utc(time).format('HH:mm:ss'),
          shortTime: moment.utc(time).format('HH:mm'),
        }));
        console.log('timesArray',timesArray)
        setTimes(timesArray);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  }

  const showModalWindow = (e) => {
    e.preventDefault();
    setDefaultModal("edit");
    setModalActive(true);
  };

  const showAlternativeModal = () => {
    setDefaultModal("alternative");
    setModalActive(true);
  };

  const makeOrderDone = async () => {
    try {
      await props.makeOrder();
      props.setModalActive(true);
      setDefaultModal("ordered");
    } catch(err) {
      console.log('err', err)
    }
  };

  console.log("Default: ", defaultModal);

  const closeHandler = () => {
    setActive(false)
    setDefaultModal("");
  }

  return (
    <div
      className={props.active ? "modal active" : "modal"}
      onClick={closeHandler}
    >
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <div
          className="close-icon"
          onClick={closeHandler}
        >✕</div>
        <div className="title modal-title">{title}</div>
        {(defaultModal === "waiting" || defaultModal === "noTime") ? (
          <div className="choose-time">
            {defaultModal === "noTime" &&
              <b>{t("Join our waiting list")}</b>
            }
            <div className="selected-date" style={{ marginBottom: "10px" }}>
              {t('You have chosen a date')}{" "}
              <b>{moment.utc(`${selectedDay.year}-${selectedDay.month}-${selectedDay.day}`).format('DD-MM-YYYY')}</b>
            </div>
            <b>{t('Please select a time:')}</b>
            <div>
              <div className="select-time">
                <div>
                  <p className="select-time-title">{t('Select time')}</p>
                </div>
                <Time setSelectedTime={props.setSelectedTime} times={times} />
              </div>
            </div>
          </div>
        ) : (
          <div className="no-choose-time">
            <b>{t('Please select a date:')}</b>
          </div>
        )}
        {defaultModal === "agreements" && (
          <p>
            <Trans i18nKey="WaitingNote">Please note this is a request for a place on the waiting list and
            not an actual booking You will only be contacted by the restaurant
            if a table becomes available. You only need to add yourself to the
            waiting list once When you click the button below, you verify that
              you have read and understood the above conditions</Trans>
          </p>
        )}
        {(defaultModal === "submit" || defaultModal === "ordered") && (
          <div>
            <div
              className="info-body"
              style={{ backgroundColor: "#f6f6f6", paddingBottom: "9px" }}
            >
              <div className="restaurant-info">
                <div className="restaurant-name">{restaurantInfo.name}</div>
                <div className="adress">
                  {restaurantInfo.address}
                  <br />
                  {restaurantInfo.zip_code} {restaurantInfo.city}
                  <br />
                  {restaurantInfo.country}
                </div>
                <div className="guests-date">
                  {t('Guests')}: &nbsp;
                  <b>{props.guestValue}</b>
                  <br />
                  {t('Day/time')}: &nbsp;
                  <b>{moment.utc(`${selectedDay.year}-${selectedDay.month}-${selectedDay.day} ${selectedTime}`).format('DD-MM-YYYY HH:mm')}</b>
                </div>
              </div>
              <div className="client-info">
                <div className="client-title">{t('Your contact information')}</div>
                <div className="client-adress">
                  {props.userData.first_name} {props.userData.last_name}
                  <br />
                  {props.userData.email}
                  <br />
                  {props.userData.phone}
                  <br />
                  {props.userData.zip_code}
                </div>
                <div className="guests-date">
                  {t('Not correct?')}
                  <br />
                  <a href="/#" onClick={(e) => showModalWindow(e)}>{t('Edit my information')}</a>
                  &nbsp;
                  <a href="/">{t('Not me')}</a>
                </div>
              </div>
            </div>
          </div>
        )}
        {defaultModal !== "waiting" &&
          defaultModal !== "agreements" &&
          defaultModal !== "noTime" &&
          defaultModal !== "ordered" && (
            <div className="form">
              <div className="title-comment-waiting">{t('Add a comment')}</div>
              <div>
                <input
                  type="text"
                  className="form-comment-waiting"
                  placeholder={t('Add a comment')}
                />
              </div>
            </div>
          )}

        {(defaultModal === "waiting" || defaultModal === "noTime" || defaultModal === "agreements") && (
          <div className="modal-button">
            <button
              type="button"
              className="button-main"
              onClick={() => setType()}
            >
              {t('Continue')} →
            </button>
          </div>
        )}
        {(defaultModal === "noTime" && props.alternativeRestaurants.length > 0) &&
          <b
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
            onClick={showAlternativeModal}
          >
            {t("Or select other our restaurant")}
          </b>
        }
        {defaultModal === "submit" && (
          <div className="modal-button">
            <button
              type="button"
              className="button-main"
              onClick={() => makeOrderDone()}
            >
              {t('Continue')} →
            </button>
          </div>
        )}
        {defaultModal === "ordered" && (
          <div style={{ marginTop: "50px" }}>
            <div>
              <a href="/#" className="waiting-footer">
                {t('Go back to the restaurant profile page')}
              </a>
            </div>
            <div>
              <a href={`/book/${props.getPlaceId()}`} className="waiting-footer">
                {t('Cancel a booking')}
              </a>
            </div>
            <div>
              <a href={`/book/${props.getPlaceId()}`} className="waiting-footer">
                {t('New booking')}
              </a>
            </div>
          </div>
        )}
        {(defaultModal === "register" ||
          defaultModal === "edit" ||
          defaultModal === "login" ||
          defaultModal === "email") && (
          <div className="error-response">
            {dispErrors?.title}
            <br />
            {dispErrors?.emailError}
            <br />
            {dispErrors?.passError}
          </div>
        )}
      </div>
    </div>
  );
}
