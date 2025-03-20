import React, {useEffect, useState} from 'react';
import PictureUploadButton from '../../../components/PictureUploadButton';
import {useTranslation} from "react-i18next";
import ListSubheader from "@mui/material/ListSubheader";
import './BookingSettings.scss'
import eventBus from "../../../../eventBus";
import {Button, FormControlLabel, Stack, Switch, TextField} from "@mui/material";
import { useNavigate } from 'react-router-dom';

export default function BookingSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pictures, setPictures] = useState({});
  const [otherSettings, setOtherSettings] = useState([]);

  useEffect(() => {
    getPictures()
    getOtherSettings()
    eventBus.on("placeChanged", () => {
      getPictures()
      getOtherSettings()
    })
  },[])

  const onChange = (e) => {
    if(e.target.files && e.target.files.length > 0){
      let formData = new FormData()
      formData.append('place_id', localStorage.getItem('place_id'))
      formData.append('file', e.target.files[0])
      axios.post(`${process.env.MIX_API_URL}/api/files/${e.target.name}`, formData,{
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        setPictures(prev => ({...prev, [response.data.purpose]: response.data}))
      }).catch(error => {
        console.log('error',error.response.status)
        if (error.response && error.response.data && error.response.data.errors) {
          for (const [key, value] of Object.entries(error.response.data.errors)) {
            eventBus.dispatch("notification", {type: 'error', message: value});
          }
        } else if (error.response.status === 401) {
          eventBus.dispatch("notification", {type: 'error', message: 'Authorization error'});
        } else if (error.response.status === 413) {
          eventBus.dispatch("notification", {type: 'error', message: 'The file failed to upload.'});
        } else {
          eventBus.dispatch("notification", {type: 'error', message: error.message});
          console.log('Error', error.message)
        }
      })
    }
    if(e.target.name === 'online_booking_description'){
      setOtherSettings(prev => ({...prev, "online-booking-description": e.target.value}))
    }
    if(e.target.name === 'online_booking_title'){
      setOtherSettings(prev => ({...prev, "online-booking-title": e.target.value}))
    }
    if(e.target.name === 'non_working_day_reason'){
      setOtherSettings(prev => ({...prev, "non-working-day-reason": e.target.value}))
    }
    if(e.target.name === 'customer_deny_register'){
      setOtherSettings(prev => ({...prev, "customer-deny-register": e.target.checked}))
    }
  }

  const onSaveOtherSettings = (e) => {
    e.preventDefault()
    let data = []
    Object.entries(otherSettings).forEach(item => [
      data.push({"name":item[0],"value":item[1]})
    ])
    axios.post(`${process.env.MIX_API_URL}/api/settings/many`, {
      place_id: localStorage.getItem('place_id'),
      data: data
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Settings saved'});
    }).catch(error => {
      console.log('error',error)
    })
  }

  const getOtherSettings = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings/many`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        names: [
          'online-booking-description',
          'online-booking-title',
          'customer-deny-register',
          'non-working-day-reason'
        ]
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      let data = []
      response.data.forEach(item => [
        data[item.name] = item.value
      ])
      setOtherSettings(data)
    }).catch(error => {
      setOtherSettings([])
    })
  }

  const getPictures = () => {
    axios.get(`${process.env.MIX_API_URL}/api/files_purpose`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        purpose: "online_booking_picture",
      },
    }).then((response) => {
      let data = []
      data[response.data.purpose] = response.data
      setPictures(data)
    }).catch((error) => {
      setPictures({})
    });
  }

  const getPicture = (purpose) => {
    return pictures.hasOwnProperty(purpose) ? pictures[purpose].url : ''
  }

  const toBoolean = (value) => {
    if(typeof value === "string") value = parseInt(value)
    if(typeof value != "boolean") value = Boolean(value)
    return value
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Booking Settings')}</h2>
        <Button
          variant="contained"
          size="sm"
          type="button"
          onClick={() => navigate('/VideoGuides')}
        >{t('See Table Booking POS Academy')}</Button>
      </Stack>
      <ListSubheader className="my-3" component="div">{t('Online booking picture')}</ListSubheader>
      <div className="row">
        <div className="col-md-6 mb-3">
          <PictureUploadButton name="online_booking_picture" onChange={e => {onChange(e)}}/>

          <TextField label={t('Online Booking Title')} size="small" fullWidth className="my-3"
                     type="text" id="online_booking_title" name="online_booking_title"
                     onChange={onChange}
                     value={otherSettings['online-booking-title'] || ''}
          />
          <TextField label={t('Online Booking Description')} size="small" fullWidth multiline rows="3" className="my-3"
                     type="text" id="online_booking_description" name="online_booking_description"
                     onChange={onChange}
                     value={otherSettings['online-booking-description'] || ''}
          />
          <TextField label={t('The reason for the non-working day')} size="small" fullWidth multiline rows="3" className="my-3"
                     type="text" id="non_working_day_reason" name="non_working_day_reason"
                     onChange={onChange}
                     value={otherSettings['non-working-day-reason'] || ''}
          />
          <div className="my-3">
            <FormControlLabel label={t('The customer does not have to register')} labelPlacement="end"
                            control={
                              <Switch onChange={onChange}
                                      name="customer_deny_register"
                                      checked={toBoolean(otherSettings['customer-deny-register'])} />
                            }/>
          </div>
          <Button variant="contained" onClick={onSaveOtherSettings}>{t('Save')}</Button>
        </div>
        <div className="col-md-6 mb-3">
          <img className="added_picture" alt="" src={getPicture('online_booking_picture')} />
        </div>
      </div>
    </div>
  )
}
