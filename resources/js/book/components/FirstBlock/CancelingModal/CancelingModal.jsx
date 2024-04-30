import PhoneInput from 'react-phone-input-2'
import "./CancelingModal.css";
import {Trans, useTranslation} from "react-i18next";
import moment from "moment";
import {TextField} from "@mui/material";
import React, {useState} from "react";
import 'react-phone-input-2/lib/material.css'
import eventBus from "../../../../eventBus";

export default function CancelingModal(props) {
  const { t } = useTranslation();
  const dispErrors = props.errorsResp;
  const {
    title,
    defaultModal,
    setDefaultModal,
    setActive,
    selectedDay,
    restaurantInfo,
    selectedTime,
  } = props;

  const [contact, setContact] = useState({})

  const onChange = (e) => {
    setContact(prev => ({...prev, [e.target.name]: e.target.value}))
  }

  const getPlaceId = () => {
    let pathArray = window.location.pathname.split('/')
    return pathArray.length === 3 ? pathArray[2] : 0
  };

  const submit = () => {
    if(defaultModal === 'morePeople'){
      axios.post(`${process.env.MIX_API_URL}/api/places/${getPlaceId()}/send_contact`,contact).then(response => {
        setContact({})
        setActive(false)
      }).catch(error => {
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
      })
    }
    if(defaultModal === 'canceling'){
      setCancelType()
    }
  }

  const setCancelType = async () => {
    // if (localStorage.getItem("token")) {
    //   await props.getOrders();
    // } else {
    //   props.setDefaultModal("confirmation");
    // }
    makeOrderDone();
  };

  const makeOrderDone = () => {
    props.callback();
  };

  const setInput = (name, value) => {
    props.setUserData((prev) => ({ ...prev, [name]: value }));
  };

  console.log("Type: ", defaultModal);

  return (
    <div
      className={props.active ? "modal active" : "modal"}
      onClick={() => setActive(false)}
    >
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <div
          className="close-icon"
          onClick={() => setActive(false)}
        >✕</div>
        {defaultModal !== "morePeople" && (
          <div className="title modal-title">
            {t('Cancel reservation at')} {restaurantInfo.name}
          </div>
        )}
        <h2>{title}</h2>
        {defaultModal === "canceling" && (
          <div className="cancel-info">
            <p>
              <Trans i18nKey="CancelingNote">
                Here you can cancel your booking. Enter your booking ID and the
                telephone no. you used when making the booking, below. Your
                booking ID is to be found in your confirmation mail. If you do not
                have your booking ID please contact the restaurant.
              </Trans>
            </p>
            <div className="cancel-inputs">
              <input
                type="email"
                className="form-name__email"
                placeholder={t('Email address')}
                onChange={(event) => setInput("bookingEmail", event.target.value)}
              />
              <input
                type="text"
                placeholder={t('Booking ID')}
                className="bookingid-input"
                onChange={(event) => setInput("bookingid", event.target.value)}
              />
            </div>
          </div>
        )}
        {defaultModal === "confirmation" && (
          <div>
            <div
              className="info-body"
              style={{
                backgroundColor: "#f6f6f6",
                paddingBottom: "9px",
                marginTop: "20px",
                justifyContent: "center",
              }}
            >
              <div className="restaurant-info" style={{ textAlign: "center" }}>
                <div className="restaurant-name" style={{ display: "block" }}>
                  {restaurantInfo.name}
                </div>
                <div className="adress" style={{ display: "block" }}>
                  {restaurantInfo.address}
                  <br />
                  {restaurantInfo.zip_code} {restaurantInfo.city}
                  <br />
                  {restaurantInfo.country}
                </div>
                <div className="guests-date">
                  {t('Guests')}: &nbsp;
                  <b>{props.filteredOrder ? props.filteredOrder[0].seats : ''}</b>
                  <br />
                  {t('Day/time')}: &nbsp;
                  <b>{props.filteredOrder ? moment.utc(props.filteredOrder[0].reservation_time).format('YYYY-MM-DD HH:mm') : ''}</b>
                </div>
              </div>
            </div>
          </div>
        )}
        {defaultModal === "morePeople" && (
          <>
            <div className="my-3">
              <TextField label={t('First name')} required size="small" fullWidth
                         type="text" id="first_name" name="first_name"
                         onChange={onChange}/>
            </div>
            <div className="mb-3">
              <TextField label={t('Last name')} required size="small" fullWidth
                         type="text" id="last_name" name="last_name"
                         onChange={onChange}/>
            </div>
            <div className="mb-3">
              <TextField label={t('Email address')} required size="small" fullWidth
                         type="email" id="email" name="email"
                         onChange={onChange}/>
            </div>
            <div className="mb-3">
              <PhoneInput
                country={'dk'}
                onChange={phone => setContact(prev => ({...prev, phone: '+'+phone}))}
                containerClass="phone-input"
              />
            </div>
            <div className="mb-3">
              <TextField label={t('Add a comment')} required size="small" fullWidth
                         type="text" id="message" name="message"
                         onChange={onChange}/>
            </div>
          </>
        )}
        {(defaultModal === "canceling" ||
          defaultModal === "morePeople") && (
            <div className="modal-button">
              <button
                type="button"
                className="button-main"
                onClick={() => submit()}
              >
                {t('Continue')} →
              </button>
            </div>
          )}
        {defaultModal === "confirmation" && (
          <div className="modal-button">
            <button
              type="button"
              className="button-main"
              onClick={() => makeOrderDone()}
            >
              {t('Cancel booking')} →
            </button>
          </div>
        )}
        {defaultModal === "canceled" && (
          <div className="modal-button">
            <button
              type="button"
              className="button-main"
              style={{ width: "250px" }}
            >
              <a href={`/book/${getPlaceId()}`} style={{ textDecoration: "none", color: "white" }}>
                {t('Make new booking')} →
              </a>
            </button>
          </div>
        )}
        {(defaultModal === "confirmation" || defaultModal === "canceling") && (
          <div className="canceling-footer">
            <a href={`/book/${getPlaceId()}`}>{t('Return without canceling')}</a>
          </div>
        )}
        {!props.ordersError && (
          <div className="error-response">{props.ordersErrorString}</div>
        )}
      </div>
    </div>
  );
}
