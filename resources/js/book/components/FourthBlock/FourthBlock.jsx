import React from "react";
import Image from "../FirstBlock/img/Image";
import "./FourthBlock.css";
import SelectLang from "../FirstBlock/SelectLang/SelectLang";
import Copyrigth from "../FirstBlock/Copyrigth/Copyrigth";
import {Trans, useTranslation} from "react-i18next";

function FourthBlock(props) {
  const { t } = useTranslation();
  const dispErrors = props.errorsResp;
  const { restaurantInfo } = props;
  return (
    <div className="content">
      <Image />
      <div className="content-wrapper">
        <div className="main-block__body">
          <div className="nav">
            <div className="back">
              <a href="/#" className="back-link" onClick={(e) => props.handlePrevItem(e)}>
                ← {t('Back')}
              </a>
            </div>
            <div className="second-step__lang">
              <SelectLang />
            </div>
          </div>
          <div className="overhead">
            <Trans>Reserved {{val: props.guestValue}} Guests</Trans>
          </div>
          <div className="title third-title">
            <Trans>Create a <br /> password</Trans>
          </div>
          <div className="second-info third-info" style={{ marginTop: "50px" }}>
            <Trans i18nKey="PasswordNote">
              With a password, we can take good care of your contact info, and you
            can always update your info on the site.
            <br />
            For future bookings like this, you will not need the password.
            </Trans>
          </div>

          <form className="form">
            <div className="form-mobile-zip"></div>
          </form>
          <button className="button-main" onClick={props.postRequest}>
            {t('Next')} →
          </button>
          <div className="error-response">
            {dispErrors?.title}
            <br />
            {dispErrors?.emailError}
            <br />
            {dispErrors?.passError}
          </div>
          <div className="copyrigth-footer">
            <Copyrigth restaurantInfo={restaurantInfo} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FourthBlock;
