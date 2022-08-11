import React from "react";
import Image from "./img/Image.jsx";
import "./MainBlock.css";
import SelectLang from "./SelectLang/SelectLang.jsx";
import Title from "./Title/Title.jsx";
import Counter from "./Counter/Counter.jsx";
import Info from "./Info/Info.jsx";
import Cancel from "./Cancel/Cancel.jsx";
import Copyrigth from "./Copyrigth/Copyrigth.jsx";
import CancelingModal from "./CancelingModal/CancelingModal.jsx";
import MainModal from "../MainModal/MainModal.jsx";
import {useTranslation} from "react-i18next";

function MainBlock(props) {
  const { t } = useTranslation();
  const isValid = props.guestValue;

  const mainProps = {
    title: `${t('Next')} →`,
  };

  const changeType = () => {
    props.handleChangeItem();
    props.setBlockType("secondblock");
  };

  const showModalWindow = (e) => {
    e.preventDefault();
    localStorage.getItem("token")
      ? props.setDefaultModal("canceling")
      : props.setDefaultModal("emailCancel");
    props.setModalActive(true);
  };

  const showModalMore = (e) => {
    e.preventDefault();
    if (localStorage.getItem("token")) {
      props.setDefaultModal("morePeople");
      props.getUserInfoReq();
    } else {
      props.setDefaultModal("emailMore");
    }
    props.setModalActive(true);
  };

  const getTitle = {
    canceling: t('Canceling'),
    confirmation: t('You are about to cancel the following reservation:'),
    canceled: t('You cancelled the reservation'),
    morePeople: t('Please enter your message'),
  };

  return (
    <div className="content">
      <Image />
      <div className="content-wrapper">
        <div className="main-block__body">
          <SelectLang />
          <Title restaurantInfo={props.restaurantInfo}/>
          <Counter
            increment={props.increment}
            decrement={props.decrement}
            guestValue={props.guestValue}
          />
          <button
            className="button-main"
            onClick={changeType}
            disabled={!isValid}
          >
            {mainProps.title}
          </button>
          <div className="main-block__info">
            {t('Booking for')}{" "}
            <a href="#" onClick={(e) => showModalMore(e)}>
              {t('more than 8')}
            </a>{" "}
            {t('people?')}
            <br /> {t('Do you want to')}{" "}
            <a href="#" onClick={(e) => showModalWindow(e)}>
              {t('cancel a booking')}
            </a>
            ?
          </div>
          <div className="main-footer">
            <a
              href="/#"
              className="cancel-booking"
              onClick={(e) => showModalWindow(e)}
            >
              {t('Cancel Booking')}
            </a>
            {(props.defaultModal === "canceling" ||
              props.defaultModal === "confirmation" ||
              props.defaultModal === "canceled" ||
              props.defaultModal === "morePeople") && (
              <CancelingModal
                title={getTitle[props.defaultModal] || ""}
                active={props.modalActive}
                setActive={props.setModalActive}
                callback={props.cancelOrder}
                getOrders={props.getOrders}
                errorsResp={props.errorsResp}
                defaultModal={props.defaultModal}
                mainProps={mainProps}
                userData={props.userData}
                setUserData={props.setUserData}
                selectedDay={props.selectedDay}
                makeOrder={props.makeOrder}
                selectedTime={props.selectedTime}
                setSelectedTime={props.setSelectedTime}
                setDefaultModal={props.setDefaultModal}
                restaurantInfo={props.restaurantInfo}
                guestValue={props.guestValue}
                getUserInfoReq={props.getUserInfoReq}
                setModalActive={props.setModalActive}
                ordersError={props.ordersError}
                ordersErrorString={props.ordersErrorString}
                filteredOrder={props.filteredOrder}
              />
            )}
            {(props.defaultModal === "emailCancel" ||
              props.defaultModal === "emailMore") && (
              <MainModal
                title={t('Please enter your email to continue')}
                active={props.modalActive}
                setActive={props.setModalActive}
                mainProps={mainProps}
                callback={props.postRequest}
                defaultModal={props.defaultModal}
                userData={props.userData}
                setUserData={props.setUserData}
              />
            )}
            {(props.defaultModal === "loginCancel" ||
              props.defaultModal === "loginMore") && (
              <MainModal
                title={t('Please enter your email and password to continue')}
                active={props.modalActive}
                setActive={props.setModalActive}
                callback={props.postRequest}
                defaultModal={props.defaultModal}
                mainProps={mainProps}
                userData={props.userData}
                setUserData={props.setUserData}
              />
            )}
            <div className="copyrigth">{props.restaurantInfo.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainBlock;
