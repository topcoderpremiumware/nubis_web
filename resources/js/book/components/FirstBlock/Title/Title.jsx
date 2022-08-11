import React from "react";
import "./Title.css";
import {Trans, useTranslation} from "react-i18next";

function Title(props) {
  const { t } = useTranslation();
  return (
    <div className="main-title">
      <div className="overhead">
        {t('Welcome to the online booking for')} {props.restaurantInfo.name}
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
