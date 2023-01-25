import React, { useState } from "react";
import Image from "../FirstBlock/img/Image";
import "./LastBlock.css";
import SelectLang from "../FirstBlock/SelectLang/SelectLang";
import Copyrigth from "../FirstBlock/Copyrigth/Copyrigth";
import MainModal from "../MainModal/MainModal";
import {Trans, useTranslation} from "react-i18next";
import PrepaymentModal from "./PrepaymentModal/PrepaymentModal";

function LastBlock(props) {
  const { t } = useTranslation();
  const [modalActive, setModalActive] = useState(false);
  const [comment, setComment] = useState('')
  const { selectedDay, selectedTime, restaurantInfo, orderResponse } = props;

  const showModalWindow = (e) => {
    e.preventDefault();
    props.setDefaultModal("edit");
    setModalActive(true);
  };

  const makeOrderDone = (e) => {
    e.preventDefault();
    props.makeOrder();
    setModalActive(true);
    // setTimeout(() => {
    //   window.location.href = "/";
    // }, 4000);
    props.setDefaultModal("done");
  };

  const logout = (e) => {
    e.preventDefault();
    props.setDefaultModal("logout");
    props.postRequest({}, "/api/customers/logout", "logout");
  };

  const handleOnChangeEmail = () => {
    if (props.allowEmails === 0) {
      props.setAllowEmails(1);
    } else {
      props.setAllowEmails(0);
    }
  };

  const handleOnChangeNews = () => {
    if (props.allowNews === 0) {
      props.setAllowNews(1);
    } else {
      props.setAllowNews(0);
    }
  };

  const changeType = (e) => {
    e.preventDefault();
    props.handlePrevItem();
    props.setBlockType("secondblock");
  };

  return (
    <div className="content">
      <Image />
      <div className="content-wrapper">
        <div className="main-block__body">
          <div className="nav">
            <div className="back">
              <a href="/#" className="back-link" onClick={props.handlePrevItem}>
                ← {t('Back')}
              </a>{" "}
              |{" "}
              <a href="#/" className="back-link" onClick={(e) => logout(e)}>
                {t('Logout')}
              </a>
            </div>
            <div className="second-step__lang">
              <SelectLang />
            </div>
          </div>
          <div className="overhead">
            <Trans>Reserved {{val: props.guestValue}} Guests</Trans>
          </div>
          <div className="title third-title">{t('Almost there')}</div>
          <div className="last-info">
            <div className="info-body">
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
                  <b>
                    {`${selectedDay.day}-${selectedDay.month}-${selectedDay.year}`}{" "}
                    {selectedTime.slice(0, 5)}
                  </b>
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
                  <a href="/#" onClick={(e) => showModalWindow(e)}>
                    {t('Edit my information')}
                  </a>
                  &nbsp;
                  <a href="/">{t('Not me')}</a>
                </div>
              </div>
            </div>

            <div className="form">
              <div className="client-title__comment">{t('Add a comment')}</div>
              <div className="form-comment">
                <input
                  type="text"
                  className="form-name__comment"
                  placeholder={t('Add the comment')}
                  value={comment}
                  onChange={ev => setComment(ev.target.value)}
                />
              </div>
              <div
                className="second-checkbox"
                style={{
                  display: "flex",
                  paddingBottom: "10px",
                }}
              >
                <input
                  type="radio"
                  id="takeawayChoice"
                  name="takeaway"
                  value="takeaway"
                  onClick={() => props.setIsTakeAway(1)}
                />
                <label htmlFor="contactChoice1">{t('Take away')}</label>
              </div>
              <div
                className="second-checkbox"
                style={{
                  display: "flex",
                }}
              >
                <input
                  type="radio"
                  id="eathereChoice"
                  name="takeaway"
                  value="eathere"
                  onClick={() => props.setIsTakeAway(0)}
                />
                <label htmlFor="eathereChoice">{t('Eat here')}</label>
              </div>
              {/* <div className="checkbox">
                <input
                  id="first-checkbox"
                  type="checkbox"
                  onChange={handleOnChangeEmail}
                  style={{ width: "14px", heigth: "14px", marginRight: "8px" }}
                />
                <div>
                  {t('Get restaurant news and inspiration from DinnerBooking.com on email.')}
                  <a href="/#">{t('See our privacy policy')}</a>
                </div>
              </div>
              <div className="second-checkbox">
                <input
                  type="checkbox"
                  onChange={handleOnChangeNews}
                  style={{
                    width: "14px",
                    heigth: "14px",
                    marginRight: "8px",
                  }}
                />
                {t('I would like to receive the restaurant newsletter by email.')}
              </div> */}
            </div>
          </div>

          <div className="next-button second-next-button">
            <a href="/#" className="next" onClick={(e) => makeOrderDone(e)}>
              {t('Complete booking')} →
            </a>
          </div>
          <div className="copyrigth-footer">
            <Copyrigth restaurantInfo={restaurantInfo} />
          </div>
          {props.defaultModal === "edit" && (
            <MainModal
              title={t('Enter your contact details')}
              active={modalActive}
              setActive={setModalActive}
              callback={props.postRequest}
              errorsResp={props.errorsResp}
              defaultModal={"edit"}
              userData={props.userData}
              setUserData={props.setUserData}
            />
          )}

          {props.defaultModal === "done" && (
            <MainModal
              title={t('Thanks!')}
              active={modalActive}
              defaultModal={"done"}
              orderResponse={orderResponse}
            >
              <div className="info-body info-body-modal">
                <div>
                  <div className="restaurant-name">{restaurantInfo.name}</div>
                  <div className="adress">
                    id: {orderResponse?.id}
                    <br />
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
                    <b>
                      {`${selectedDay.day}-${selectedDay.month}-${selectedDay.year}`}{" "}
                      {selectedTime.slice(0, 5)}
                    </b>
                  </div>
                </div>
                <div>
                  <div className="client-title">{t('Your contact information')}</div>
                  <div className="client-adress">
                    {props.userData.first_name} {props.userData.last_name}
                    <br />
                    {props.userData.email}
                    <br />
                    {props.userData.phone}
                    <br />
                    {props.userData.zip_code}
                    <br />
                    <div style={{marginTop: '10px'}}><b>Comment:</b> {comment || '-'}</div>
                    <br />
                    <div><b>Type:</b> {props.isTakeAway ? t('Take away') : t('Eat here')}</div>
                  </div>
                </div>
                <div className="thanks-actions">
                  <div>
                    {t('Cancel a booking')}
                  </div>
                  <div onClick={() => window.location.reload()}>
                    {t('New booking')}
                  </div>
                </div>
              </div>
            </MainModal>
          )}
          {/* {props.defaultModal === 'prepayment' && */}
            <PrepaymentModal
              // active={modalActive}
              active={true}
              setActive={setModalActive}
              restaurantInfo={restaurantInfo}
              selectedDay={selectedDay}
              selectedTime={selectedTime}
              guestValue={props.guestValue}
            />
          {/* }  */}
        </div>
      </div>
    </div>
  );
}

export default LastBlock;
