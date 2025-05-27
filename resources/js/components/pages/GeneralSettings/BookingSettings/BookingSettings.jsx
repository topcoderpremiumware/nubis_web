import React, {useEffect, useState} from 'react';
import PictureUploadButton from '../../../components/PictureUploadButton';
import {useTranslation} from "react-i18next";
import ListSubheader from "@mui/material/ListSubheader";
import './BookingSettings.scss'
import eventBus from "../../../../eventBus";
import {Button, FormControlLabel, Stack, Switch, TextField} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import WYSIWYG from "../../../components/WYSIWYG";

export default function BookingSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pictures, setPictures] = useState([]);
  const [otherSettings, setOtherSettings] = useState([]);

  useEffect(() => {
    getPictures()
    getOtherSettings()
    function placeChanged(){
      getPictures()
      getOtherSettings()
    }
    eventBus.on("placeChanged", placeChanged)

    return () => {
      eventBus.remove("placeChanged", placeChanged)
    }
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
        getPictures()
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
    if(e.target.name === 'online_booking_background_video'){
      setOtherSettings(prev => ({...prev, "online-booking-background-video": e.target.value}))
    }
  }

  const deleteFile = (e,file) => {
    if (window.confirm(t('Are you sure you want to delete this file?'))) {
      axios.delete(`${process.env.MIX_API_URL}/api/files/${file.id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        getPictures()
        eventBus.dispatch("notification", {type: 'success', message: 'File deleted successfully'});
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
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
          'non-working-day-reason',
          'online-booking-background-video'
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
    axios.get(`${process.env.MIX_API_URL}/api/files_many_purposes`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        purposes: ['online_booking_picture','online_booking_logo','online_booking_background'],
      },
    }).then((response) => {
      setPictures(response.data)
    }).catch((error) => {
      setPictures({})
    });
  }

  const getPicture = (purpose, is_array= false) => {
    let picture = pictures.filter(el => el.purpose === purpose)
    if(picture.length === 0) return ''
    if(is_array){
      return picture
    }else{
      return picture[0].url
    }
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
      <ListSubheader className="my-3" component="div">{t('Online booking logo')}</ListSubheader>
      <div className="row">
        <div className="col-md-6 mb-3">
          <Stack spacing={2} direction="row" alignItems="center">
            {getPicture('online_booking_logo') && <Button variant="contained" color="error"
              onClick={(e) => deleteFile(e,getPicture('online_booking_logo',true)[0])}
            >{t('Delete')}</Button>}
            <PictureUploadButton name="online_booking_logo" onChange={e => {onChange(e)}}/>
          </Stack>
        </div>
        <div className="col-md-6 mb-3">
          <img className="added_picture" alt="" src={getPicture('online_booking_logo')} />
        </div>
      </div>
      <ListSubheader className="my-3" component="div">{t('Online booking background')}</ListSubheader>
      <div className="row">
        <div className="col-md-6 mb-3">
          <Stack spacing={2} direction="row" alignItems="center">
            {getPicture('online_booking_background') && <Button variant="contained" color="error"
              onClick={(e) => deleteFile(e,getPicture('online_booking_background',true)[0])}
            >{t('Delete')}</Button>}
            <PictureUploadButton name="online_booking_background" onChange={e => {onChange(e)}}/>
          </Stack>
          <TextField label={t('Online Booking Background Video')} size="small" fullWidth className="my-3"
                     type="text" id="online_booking_background_video" name="online_booking_background_video"
                     onChange={onChange}
                     value={otherSettings['online-booking-background-video'] || ''}
          />
        </div>
        <div className="col-md-6 mb-3">
          <img className="added_picture" alt="" src={getPicture('online_booking_background')} />
        </div>
      </div>
      <ListSubheader className="my-3" component="div">{t('Online booking picture')}</ListSubheader>
      <div className="row">
        <div className="col-md-6 mb-3">
          <Stack spacing={2} direction="row" alignItems="center">
            {getPicture('online_booking_picture') && <Button variant="contained" color="error"
              onClick={(e) => deleteFile(e,getPicture('online_booking_picture',true)[0])}
            >{t('Delete')}</Button>}
            <PictureUploadButton name="online_booking_picture" onChange={e => {onChange(e)}}/>
          </Stack>
          <WYSIWYG label={t('Online Booking Title')} className="my-3"
                   name="online_booking_title" onChange={onChange}
                   value={otherSettings['online-booking-title'] || ''}
          />
          <WYSIWYG label={t('Online Booking Description')} className="my-3"
                   name="online_booking_description" onChange={onChange}
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
