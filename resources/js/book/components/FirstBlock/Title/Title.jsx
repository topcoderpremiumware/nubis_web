import React, {useEffect, useState} from "react";
import "./Title.css";
import {Trans, useTranslation} from "react-i18next";
import axios from "axios";
import eventBus from "../../../../eventBus";

function Title(props) {
  const { t } = useTranslation();
  const [onlineBookingDescription, setOnlineBookingDescription] = useState("");

  useEffect(() => {
    getOnlineBookingDescription()
  },[])

  const getPlaceId = () => {
    let pathArray = window.location.pathname.split('/')
    return pathArray.length === 3 ? pathArray[2] : 0
  };

  const getOnlineBookingDescription = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${getPlaceId()}/online_booking_description`)
    setOnlineBookingDescription(res.data['online-booking-description'])
  }

  return (
    <div className="main-title">
      <img className="book_site_logo" src="/images/default_place_image.png" alt="" />
      <div className="overhead">
        {t('Welcome to the online booking for')} {props.restaurantInfo.name}
      </div>
      <div className="description">
        {onlineBookingDescription}
      </div>
      <div className="title">
        <Trans i18nKey="select_number_of_guests">
          Select number <br /> of Guests
        </Trans>
      </div>
    </div>
  );
}

export default Title;
