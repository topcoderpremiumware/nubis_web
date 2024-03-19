import React, {useEffect, useState} from "react";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import "./MainModal.css";
import {useTranslation} from "react-i18next";

export default function MainModal(props) {
  const { t } = useTranslation();
  const dispErrors = props.errorsResp;
  const {
    title,
    setUserData,
    userData,
    defaultModal,
    setActive,
    orderResponse,
  } = props;
  const [customerDenyRegister, setCustomerDenyRegister] = useState(false);

  const getPlaceId = () => {
    let pathArray = window.location.pathname.split('/')
    return pathArray.length === 3 ? pathArray[2] : 0
  };

  useEffect(() => {
    getSettings()
  },[])

  const getSettings = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: getPlaceId(),
        name: 'customer-deny-register'
      }
    }).then(response => {
      setCustomerDenyRegister(Boolean(parseInt(response.data.value)))
    }).catch(error => {
      setCustomerDenyRegister(false)
    })
  }

  const setInput = (name, value) => {
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const getUrl = {
    register: "/api/customers/register",
    email: "/api/customers/verify",
    emailWait: "/api/customers/verify",
    emailCancel: "/api/customers/verify",
    emailMore: "/api/customers/verify",
    login: "/api/customers/login",
    loginWait: "/api/customers/login",
    loginCancel: "/api/customers/login",
    loginMore: "/api/customers/login",
    edit: "/api/customers",
  };

  return (
    <div
      className={props.active ? "modal active" : "modal"}
      onClick={() => setActive(false)}
    >
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        {defaultModal !== "done" && (
          <div
            className="close-icon"
            onClick={() => setActive(false)}
          >✕</div>
        )}
        <div className="title modal-title">{title}</div>
        {(defaultModal === "done" && props.children) ? props.children : null}
        {defaultModal !== "done" && (
          <form className="form form-modal">
            <div className="form-name">
              {(defaultModal === "register" || defaultModal === "edit") && (
                <>
                  <input
                    type="text"
                    className="form-name__firstname"
                    placeholder={t('First Name')}
                    value={userData.first_name}
                    onChange={(event) =>
                      setInput("first_name", event.target.value)
                    }
                  />
                  <input
                    type="text"
                    className="form-name__firstname"
                    placeholder={t('Last Name')}
                    value={userData.last_name}
                    onChange={(event) =>
                      setInput("last_name", event.target.value)
                    }
                  />
                </>
              )}
            </div>
            <div className="form__wrapper">
              {[
                "register",
                "edit",
                "login",
                "email",
                "loginWait",
                "emailWait",
                "emailCancel",
                "loginCancel",
                "emailMore",
                "loginMore"].includes(defaultModal) && (
                <input
                  type="email"
                  className="form-name__email"
                  placeholder={t('Email address')}
                  value={userData?.email}
                  onChange={(event) => setInput("email", event.target.value)}
                />
              )}
            </div>
            <div className="form-mobile-zip">
              {["register","edit"].includes(defaultModal) && (
                <>
                  <PhoneInput
                    country={'dk'}
                    value={userData.phone}
                    onChange={phone => setInput("phone", '+'+phone)}
                    inputClass="phone-input"
                    buttonClass="phone-input-btn"
                    dropdownStyle={{ textAlign: 'left' }}
                  />
                  {((defaultModal == "register" && !customerDenyRegister) || defaultModal == "edit") &&
                  <input
                    type="text"
                    className="form-name__zip"
                    placeholder={t('Zip code')}
                    value={userData.zip_code}
                    onChange={(event) =>
                      setInput("zip_code", event.target.value)
                    }
                  />
                  }
                </>
              )}
            </div>
            <div className="form-password">
              {((["register"].includes(defaultModal) && !customerDenyRegister) ||
                ["login","loginWait","loginCancel","loginMore"].includes(defaultModal)) && (
                  <>
                    <input
                      type="password"
                      className="form-name__password"
                      placeholder={t('Password')}
                      value={userData.password}
                      onChange={(event) => setInput("password", event.target.value)}
                    />
                    {defaultModal !== "register" && <a href="/admin/forgot?type=customer">{t('Forgot password?')}</a>}
                  </>
              )}
              {(defaultModal === "register" && !customerDenyRegister) && (
                <input
                  type="password"
                  className="form-name__confirm-password"
                  placeholder={t('Confirm password')}
                  value={userData.password_confirmation}
                  onChange={(event) =>
                    setInput("password_confirmation", event.target.value)
                  }
                />
              )}
            </div>
          </form>
        )}
        {[
          "register",
          "edit",
          "login",
          "email",
          "loginWait",
          "emailWait",
          "emailCancel",
          "loginCancel",
          "emailMore",
          "loginMore"].includes(defaultModal) && (
          <div className="modal-button">
            <button
              className="button-main"
              onClick={() =>
                props.callback(userData, getUrl[defaultModal], defaultModal)
              }
            >
              {t('Continue')} →
            </button>
          </div>
        )}

        {["register","edit","login","email"].includes(defaultModal) && (
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
