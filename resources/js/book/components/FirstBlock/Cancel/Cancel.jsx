import React from "react";
import {useTranslation} from "react-i18next";

function Cancel(props) {
  const { t } = useTranslation();
  const showModalWindow = (e) => {
    e.preventDefault();
    props.setDefaultModal("canceling");
    props.setModalActive(true);
  };

  console.log("Is active: ", props.modalActive);

  return (
    <a href="/#" className="cancel-booking" onClick={(e) => showModalWindow(e)}>
      {t('Cancel Booking')}
    </a>
  );
}

export default Cancel;
