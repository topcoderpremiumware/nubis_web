import { FormControl, MenuItem, OutlinedInput, Select } from '@mui/material';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import './SelectRestaurantModal.scss'

const SelectRestaurantModal = (props) => {
  const { t } = useTranslation();

  const {
    data,
    active,
    setActive,
  } = props;

  const [selectedRest, setSelectedRest] = useState('')
  
  return (
    <div
      className={active ? "modal active" : "modal"}
      onClick={() => setActive(false)}
    >
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <div 
          className="close-icon" 
          onClick={() => setActive(false)}
        >✕</div>
        <div className="title modal-title" style={{textTransform: 'capitalize'}}>{t('select other our restaurant')}</div>
        <FormControl sx={{ m: 1, width: 300, mt: 3 }}>
          <Select
            displayEmpty
            value={selectedRest}
            onChange={(ev) => setSelectedRest(ev.target.value)}
            input={<OutlinedInput />}
            inputProps={{ 'aria-label': 'Without label' }}
          >
            <MenuItem disabled value="">
              <em>{t('select other our restaurant')}</em>
            </MenuItem>
            {data.map((i) => (
              <MenuItem
                key={i.id}
                value={i.id}
              >
                {i.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className="modal-button">
          <button
            type="button"
            className="button-main"
            disabled={!selectedRest}
            onClick={() => window.location.href = `/book/${selectedRest}`}
          >
            {t('Continue')} →
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectRestaurantModal