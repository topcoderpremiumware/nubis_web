import Reac from "react";
import Image from "../FirstBlock/img/Image";
import "../SecondBlock/SecondBlock.css";
import SelectLang from "../FirstBlock/SelectLang/SelectLang";
import Copyrigth from "../FirstBlock/Copyrigth/Copyrigth";
import { Trans, useTranslation } from "react-i18next";
import { useState } from "react";
import { useEffect } from "react";

function SelectArea(props) {
  const { t } = useTranslation();
  const {
    restaurantInfo,
  } = props;

  const checkToken = () => {
    if(selectedArea){
      props.handleChangeItem();
      props.setBlockType("secondblock");
    }
  }

  const [selectedArea, setSelectedArea] = useState('')

  useEffect(() => {
    if(props.areas.length > 0){
      localStorage.setItem('area_id', props.areas[0].id)
      setSelectedArea(props.areas[0].id)
    }
  }, [])

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
          <div className="overhead second-overhead">
            <Trans>Reserved {{ val: props.guestValue }} Guests</Trans>
          </div>
          <div className="title second-title">{t('Select Area')}</div>
          {props.areas.map((i,key) => (
            <div style={{textAlign: 'left'}} key={key}>
              <label>
                <input
                  key={i.id}
                  name={'area'}
                  type="radio"
                  value={i.id}
                  checked={selectedArea === i.id}
                  onChange={() => {
                    setSelectedArea(i.id)
                    localStorage.setItem('area_id', i.id)
                  }}
                />
                &nbsp;
                {i.name}
              </label>
            </div>
          ))}
          <div
            className="button-main next-button"
            onClick={checkToken}
            style={{ marginTop: "40px" }}
          >
            {t('Next')} →
          </div>
          <div className="footer">
            <Copyrigth restaurantInfo={restaurantInfo} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectArea;
