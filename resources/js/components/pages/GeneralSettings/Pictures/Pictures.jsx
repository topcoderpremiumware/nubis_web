import React, {useEffect, useState} from 'react';
import PictureUploadButton from './PictureUploadButton';
import {useTranslation} from "react-i18next";
import ListSubheader from "@mui/material/ListSubheader";
import './Pictures.scss'
import eventBus from "../../../../eventBus";
import {Button, Stack, TextField} from "@mui/material";
import { useNavigate } from 'react-router-dom';

export default function Pictures() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pictures, setPictures] = useState({});
  const [onlineBookingTitle, setOnlineBookingTitle] = useState('');
  const [onlineBookingDescription, setOnlineBookingDescription] = useState('');

  useEffect(() => {
    getPictures()
    getOnlineDescription()
    eventBus.on("placeChanged", () => {
      getPictures()
      getOnlineDescription()
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
    if(e.target.name === 'online_booking_description') setOnlineBookingDescription(e.target.value)
    if(e.target.name === 'online_booking_title') setOnlineBookingTitle(e.target.value)
  }

  const onSaveDescription = (e) => {
    e.preventDefault()
    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'online-booking-description',
      value: onlineBookingDescription
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online Booking Description saved'});
    }).catch(error => {})
    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'online-booking-title',
      value: onlineBookingTitle
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online Booking Title saved'});
    }).catch(error => {
      console.log('error',error)
    })
  }

  const getOnlineDescription = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'online-booking-description'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setOnlineBookingDescription(response.data.value)
    }).catch(error => {
      setOnlineBookingDescription('')
    })
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'online-booking-title'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setOnlineBookingTitle(response.data.value)
    }).catch(error => {
      setOnlineBookingTitle('')
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

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Pictures')}</h2>
        <Button
          variant="contained"
          size="sm"
          type="button"
          onClick={() => navigate('/VideoGuides')}
        >{t('See Nubis Academy')}</Button>
      </Stack>
      <ListSubheader className="my-3" component="div">{t('Online booking picture')}</ListSubheader>
      <div className="row">
        <div className="col-md-6 mb-3">
          <PictureUploadButton name="online_booking_picture" onChange={e => {onChange(e)}}/>

          <TextField label={t('Online Booking Title')} size="small" fullWidth className="my-3"
                     type="text" id="online_booking_title" name="online_booking_title"
                     onChange={onChange}
                     value={onlineBookingTitle}
          />
          <TextField label={t('Online Booking Description')} size="small" fullWidth multiline rows="3" className="my-3"
                     type="text" id="online_booking_description" name="online_booking_description"
                     onChange={onChange}
                     value={onlineBookingDescription}
          />
          <Button variant="contained" onClick={onSaveDescription}>{t('Save')}</Button>
        </div>
        <div className="col-md-6 mb-3">
          <img className="added_picture" alt="" src={getPicture('online_booking_picture')} />
        </div>
      </div>
    </div>
  )
}
