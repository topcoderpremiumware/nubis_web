import React from 'react'
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const ReminderTime = () => {
  const { t } = useTranslation();

  const [smsTime, setSmsTime] = useState(0)
  const [emailTime, setEmailTime] = useState(0)

  const onSubmit = (e) => {
    e.preventDefault();
  }

  return (
    <div className='pages__container'>
      <h2>{t('Reminder Time')}</h2>
      <div className="container-fluid">
        <div className="row">
          <div className="mt-3">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <FormControl size="small" fullWidth>
                  <InputLabel id="label_country_id">SMS reminder period</InputLabel>
                  <Select
                    label={'SMS reminder period'}
                    value={smsTime}
                    labelId="label_country_id"
                    id="country_id"
                    name="country_id"
                    onChange={(ev) => setSmsTime(ev.target.value)}
                  >
                    {/* {countries.map((c, key) => {
                      return <MenuItem key={key} value={c.id}>{c.name}</MenuItem>
                    })} */}
                  </Select>
                </FormControl>
              </div>
              <div className="mb-3">
                <FormControl size="small" fullWidth>
                  <InputLabel id="label_country_id">Email reminder periond</InputLabel>
                  <Select
                    label={'Email reminder periond'}
                    value={emailTime}
                    labelId="label_country_id"
                    id="country_id"
                    name="country_id"
                    onChange={(ev) => setEmailTime(ev.target.value)}
                  >
                    {/* {countries.map((c, key) => {
                      return <MenuItem key={key} value={c.id}>{c.name}</MenuItem>
                    })} */}
                  </Select>
                </FormControl>
              </div>
              <Button variant="contained" type="submit">{t('Save')}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReminderTime