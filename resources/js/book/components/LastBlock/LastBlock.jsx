import React, { useState } from "react";
import Image from "../FirstBlock/img/Image";
import "./LastBlock.css";
import SelectLang from "../FirstBlock/SelectLang/SelectLang";
import Copyrigth from "../FirstBlock/Copyrigth/Copyrigth";
import MainModal from "../MainModal/MainModal";
import { Trans, useTranslation } from "react-i18next";
import PrepaymentModal from "./PrepaymentModal/PrepaymentModal";
import axios from "axios";
import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from "react";

function LastBlock(props) {
  const { t } = useTranslation();
  const [modalActive, setModalActive] = useState(false);
  const [comment, setComment] = useState('')
  const { selectedDay, selectedTime, restaurantInfo, orderResponse } = props;

  const [stripeKey, setStripeKey] = useState('')
  const [stripeSecret, setStripeSecret] = useState('')
  const [paymentMethod, setPaymentMethod] = useState({})
  const [gifts, setGifts] = useState([])
  const [giftCode, setGiftCode] = useState('')
  const [error, setError] = useState('')
  const [checkingGiftCard, setCheckingGiftCard] = useState(false)
  const [appliedGift, setAppliedGift] = useState(null)
  const [discount, setDiscount] = useState(0)

  const showModalWindow = (e) => {
    e.preventDefault();
    props.setDefaultModal("edit");
    setModalActive(true);
  };

  const makeOrderDone = async () => {
    const isOnline = paymentMethod?.['is-online-payment'] === '1'
    const method = paymentMethod?.['online-payment-method']

    try {
      if (!isOnline) {
        await props.makeOrder()
        setModalActive(true);
        props.setDefaultModal("done");
      } else if (method === 'deduct') {
        // spend gift
        await props.makeOrder();
        // window.location.href = orderResponse?.prepayment_url
      } else if (method === 'reserve' || method === 'no-show') {
        setModalActive(true);
        props.setDefaultModal("prepayment");
      }
    } catch (err) {
      setError(err.message)
    }
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

  const getStripeKeys = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/customers/client_secret`, {
      params: {
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    const key = res.data['stripe-key']
    const secret = res.data['stripe-client-secret']

    setStripeSecret(secret)

    let key_parts = key.split('_')
    let clear_key_part = key_parts[2].slice(1, -1)
    let clear_key = key_parts[0] + '_' + key_parts[1] + '_' + clear_key_part
    const stripe = await loadStripe(clear_key)
    setStripeKey(stripe)
  }

  const getPaymentMethod = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/payment_method`)
    setPaymentMethod(res.data)
  }

  const getGiftCards = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/giftcards`, {
      params: {
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    setGifts(res.data)
  }

  const checkGiftCard = async () => {
    if (!giftCode) {
      setError('Enter a code')
      return
    }

    try {
      setCheckingGiftCard(true)
      setError('')

      const res = await axios.get(`${process.env.MIX_API_URL}/api/giftcards_check`, {
        params: {
          code: giftCode
        },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })

      setAppliedGift(res.data)

      const orderTotal = props.guestValue * paymentMethod['online-payment-amount']
      const currGiftAmount = res.data.initial_amount - res.data.spend_amount

      if (currGiftAmount) {
        setDiscount(orderTotal > currGiftAmount ? currGiftAmount : orderTotal)
      }
    } catch (err) {
      setError(err.response.data.message)
    } finally {
      setCheckingGiftCard(false)
    }
  }

  useEffect(() => {
    getStripeKeys()
    getPaymentMethod()
    getGiftCards()
  }, [])

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
            <Trans>Reserved {{ val: props.guestValue }} Guests</Trans>
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

              {gifts.length > 0 &&
                paymentMethod?.['is-online-payment'] === '1' &&
                (paymentMethod?.['online-payment-method'] === 'deduct' ||
                  paymentMethod?.['online-payment-method'] === 'reserve') && (
                  <div>
                    <div className="client-title__comment">{t('Apply discount')}</div>
                    <div className="discount-wrapper">
                      <input
                        type="text"
                        className="form-name__comment"
                        placeholder={t('Enter a discount code')}
                        value={giftCode}
                        onChange={ev => setGiftCode(ev.target.value)}
                        readOnly={checkingGiftCard || appliedGift}
                      />
                      <button
                        type="button"
                        className="next-button discount-btn next"
                        disabled={checkingGiftCard || appliedGift}
                        onClick={checkGiftCard}
                      >
                        {checkingGiftCard
                          ? t('Checking...')
                          : appliedGift
                            ? t('Applied')
                            : t('Apply')
                        }
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          {discount > 0 && <p className="discount">{t('Your discount is')} <b>{discount} DKK</b></p>}

          <button
            type="button"
            className="next-button second-next-button next"
            onClick={makeOrderDone}
          >
            {t('Complete booking')} →
          </button>

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
                    <div style={{ marginTop: '10px' }}><b>Comment:</b> {comment || '-'}</div>
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

          {props.defaultModal === 'prepayment' &&
            <PrepaymentModal
              active={modalActive}
              setActive={setModalActive}
              restaurantInfo={restaurantInfo}
              selectedDay={selectedDay}
              selectedTime={selectedTime}
              guestValue={props.guestValue}
              stripeKey={stripeKey}
              stripeSecret={stripeSecret}
              paymentInfo={paymentMethod}
              makeOrder={props.makeOrder()}
              discount={discount}
            />
          }
        </div>
      </div>
    </div>
  );
}

export default LastBlock;
