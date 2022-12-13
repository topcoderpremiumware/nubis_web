import React, {useEffect} from 'react'
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import eventBus from "../../../../eventBus";

const ReminderTime = () => {
  const { t } = useTranslation();

  const [smsTime, setSmsTime] = useState(0)
  const [emailTime, setEmailTime] = useState(0)

  useEffect(() => {
    getSmsTime()
    getEmailTime()
  },[])

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(`${process.env.APP_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'sms-remind-hours-before',
      value: smsTime
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'SMS Settings saved'});
    }).catch(error => {})

    axios.post(`${process.env.APP_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'email-remind-hours-before',
      value: emailTime
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Email Settings saved'});
    }).catch(error => {})
  }

  const getSmsTime = () => {
    axios.get(`${process.env.APP_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'sms-remind-hours-before'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setSmsTime(response.data.value)
    }).catch(error => {})
  }

  const getEmailTime = () => {
    axios.get(`${process.env.APP_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'email-remind-hours-before'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setEmailTime(response.data.value)
    }).catch(error => {})
  }

  const options = () => {
    let output = []
    for(let i=1;i<=48;i++){
      output.push({name:i+' hours before',value:i})
    }
    return output
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
                    {options().map((c, key) => {
                      return <MenuItem key={key} value={c.value}>{c.name}</MenuItem>
                    })}
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
                    {options().map((c, key) => {
                      return <MenuItem key={key} value={c.value}>{c.name}</MenuItem>
                    })}
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
