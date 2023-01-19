import React from 'react'
import { useTranslation } from 'react-i18next';
import './SelectRestaurantModal.scss'

const SelectRestaurantModal = (props) => {
  const { t } = useTranslation();

  const {
    active,
    setActive,
  } = props;
  
  return (
    <div
      className={active ? "modal active" : "modal"}
      onClick={() => setActive(false)}
    >
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="title modal-title">SelectRestaurantModal</div>
      </div>
    </div>
  )
}

export default SelectRestaurantModal