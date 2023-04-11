import React from "react";
import Image from "../FirstBlock/img/Image";
import "./ThirdBlock.css";
import SelectLang from "../FirstBlock/SelectLang/SelectLang";
import Copyrigth from "../FirstBlock/Copyrigth/Copyrigth";
import {Trans, useTranslation} from "react-i18next";

function ThirdBlock(props) {
  const { t } = useTranslation();
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
            <Trans>Enter your <br /> Contact Details</Trans>
          </div>
          <form className="form">
            <div className="form-name"></div>
            <div className="form-email"></div>
            <div className="form-mobile-zip"></div>
          </form>
          <button className="button-main" onClick={props.handleChangeItem}>
            {t('Next')} →
          </button>

          <div className="second-info">
            {t('By creating a Nubis profile I accept the')}{" "}
            <a className="no-border" href="/#">
              {t('general terms')}
            </a>
            . <Trans>I <br />
            further accept that Nubis can collect and process <br />
            personal information bases on our</Trans>{" "}
            <a className="no-border" href="/#">
              {t('privacy policy.')}
            </a>
            <Copyrigth restaurantInfo={restaurantInfo} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThirdBlock;
