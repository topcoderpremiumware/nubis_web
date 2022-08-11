import React from "react";
import {useTranslation} from "react-i18next";

function Nav({ guestValue }) {
  const { t } = useTranslation();
  return (
    <div className="nav">
      <div className="back">← {t('Back')} </div>
    </div>
  );
}

export default Nav;
