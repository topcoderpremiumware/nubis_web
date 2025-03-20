import {Button, FormControl, InputLabel, MenuItem, Select, Stack} from '@mui/material'
import React, {useEffect} from 'react'
import { useState } from 'react'
import eventBus from "../../../../eventBus";
import {useTranslation} from "react-i18next";
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css'
import './NotificationsSettings.scss';
import DeleteIcon from '@mui/icons-material/Delete';

const NotificationsSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [numbers, setNumbers] = useState([])
  const [smsTime, setSmsTime] = useState(0)
  const [emailTime, setEmailTime] = useState(0)

  useEffect(() => {
    getSmsTime()
    getEmailTime()
    getNumber()
    eventBus.on("placeChanged", () => {
      getSmsTime()
      getEmailTime()
      getNumber()
    })
  },[])

  useEffect(() => {
    console.log('numbers',numbers)
  },[numbers])

  const onSave = async (e) => {
    e.preventDefault()
    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'sms-remind-hours-before',
      value: smsTime
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'SMS Settings saved'});
    }).catch(error => {})

    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'email-remind-hours-before',
      value: emailTime
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Email Settings saved'});
    }).catch(error => {})

    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'sms-notification-number',
      value: numbers.join(',')
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'SMS notification number saved'});
    }).catch(error => {})
  }

  const getSmsTime = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'sms-remind-hours-before'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setSmsTime(response.data.value)
    }).catch(error => {
      setSmsTime(0)
    })
  }

  const getEmailTime = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'email-remind-hours-before'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setEmailTime(response.data.value)
    }).catch(error => {
      setEmailTime(0)
    })
  }

  const getNumber = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'sms-notification-number'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setNumbers(response.data.value.split(','))
    }).catch(error => {
      setNumbers([])
    })
  }

  const options = () => {
    let output = []
    for(let i=1;i<=48;i++){
      output.push({name:i+' hours before',value:i})
    }
    return output
  }

  const removePhone = (key) => {
    let tempNumbers = numbers
    tempNumbers.splice(key, 1)
    setNumbers(prev => ([...tempNumbers]))
  }

  const changePhone = (key, phone) => {
    let tempNumbers = numbers
    tempNumbers[key] = phone
    setNumbers(prev => ([...tempNumbers]))
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Notification Settings')}</h2>
        <Button
          variant="contained"
          size="sm"
          type="button"
          onClick={() => navigate('/VideoGuides')}
        >{t('See Table Booking POS Academy')}</Button>
      </Stack>
      <div className="container-fluid">
        <div className="row">
          <div className="mt-3">
            <form onSubmit={onSave}>
              <div className="mb-3">
                <FormControl size="small" fullWidth>
                  <InputLabel id="label_country_id">{t('SMS reminder period')}</InputLabel>
                  <Select
                    label={t('SMS reminder period')}
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
                  <InputLabel id="label_country_id">{t('Email reminder period')}</InputLabel>
                  <Select
                    label={t('Email reminder period')}
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
              {numbers.length > 0 && numbers.map((number, key) => {
                return <div className="mb-3" key={key}>
                  <Stack spacing={2} direction="row">
                    <PhoneInput
                      specialLabel={t('Admin SMS number')}
                      country={'dk'}
                      value={number}
                      onChange={phone => changePhone(key,'+'+phone)}
                      containerClass="phone-input"
                    />
                    <Button variant="contained" color="error" type="button" onClick={() => {removePhone(key)}}>
                      <DeleteIcon />
                    </Button>
                  </Stack>
                </div>
              })}
              <div className="mb-3">
                <Button variant="contained" type="button" color="success" onClick={() => {setNumbers(prev => ([...prev,'']))}}>
                  {t('Add admin SMS number')}
                </Button>
              </div>
              <Button variant="contained" type="submit">{t('Save')}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsSettings
