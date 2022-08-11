import React from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
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
        <div className="title modal-title">{title}</div>
        {defaultModal !== "done" && (
          <form className="form form-modal">
            <div className="form-name">
              {(defaultModal === "register" || defaultModal === "edit") && (
                <div>
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
                </div>
              )}
            </div>
            <div className="form__wrapper">
              {(defaultModal === "register" ||
                defaultModal === "edit" ||
                defaultModal === "login" ||
                defaultModal === "email" ||
                defaultModal === "loginWait" ||
                defaultModal === "emailWait" ||
                defaultModal === "emailCancel" ||
                defaultModal === "loginCancel" ||
                defaultModal === "emailMore" ||
                defaultModal === "loginMore") && (
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
              {(defaultModal === "register" || defaultModal === "edit") && (
                <div className="form-mobile-number" style={{ display: "flex" }}>
                  <PhoneInput
                    defaultCountry="DK"
                    value={userData.phone}
                    onChange={(val) => setInput("phone", val)}
                    className="form-name__mobile"
                    placeholder={t('Mobile number')}
                  />
                  <div>
                    <input
                      type="text"
                      className="form-name__zip"
                      placeholder={t('Zip code')}
                      value={userData.zip_code}
                      onChange={(event) =>
                        setInput("zip_code", event.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="form-password">
              {(defaultModal === "login" ||
                defaultModal === "loginWait" ||
                defaultModal === "register" ||
                defaultModal === "loginCancel" ||
                defaultModal === "loginMore") && (
                <input
                  type="password"
                  className="form-name__password"
                  placeholder={t('Password')}
                  value={userData.password}
                  onChange={(event) => setInput("password", event.target.value)}
                />
              )}
              {defaultModal === "register" && (
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
        {(defaultModal === "register" ||
          defaultModal === "edit" ||
          defaultModal === "login" ||
          defaultModal === "email" ||
          defaultModal === "loginWait" ||
          defaultModal === "emailWait" ||
          defaultModal === "emailCancel" ||
          defaultModal === "loginCancel" ||
          defaultModal === "emailMore" ||
          defaultModal === "loginMore") && (
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
