import React, {useEffect, useState} from 'react';
import PictureUploadButton from './PictureUploadButton';
import {useTranslation} from "react-i18next";
import ListSubheader from "@mui/material/ListSubheader";
import './Pictures.scss'
import eventBus from "../../../../eventBus";

export default function Pictures() {
  const { t } = useTranslation();

  const [pictures, setPictures] = useState({});

  useEffect(() => {
    getPictures()
    eventBus.on("placeChanged", () => {
      getPictures()
    })
  },[])

  const onChange = (e) => {
    if(e.target.files.length > 0){
      let formData = new FormData()
      formData.append('place_id', localStorage.getItem('place_id'))
      formData.append('file', e.target.files[0])
      axios.post(`${process.env.MIX_APP_URL}/api/files/${e.target.name}`, formData,{
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        setPictures(prev => ({...prev, [response.data.purpose]: response.data}))
      }).catch(error => {
        if (error.response && error.response.data && error.response.data.errors) {
          for (const [key, value] of Object.entries(error.response.data.errors)) {
            eventBus.dispatch("notification", {type: 'error', message: value});
          }
        } else if (error.response.status === 401) {
          eventBus.dispatch("notification", {type: 'error', message: 'Authorization error'});
        } else {
          eventBus.dispatch("notification", {type: 'error', message: error.message});
          console.log('Error', error.message)
        }
      })
    }
  }

  const getPictures = () => {
    axios.get(process.env.MIX_APP_URL+'/api/files',{
      params: {
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      let data = []
      response.data.forEach(item => {
        data[item.purpose] = item
      })
      setPictures(data)
    }).catch(error => {
      setPictures({})
    })
  }

  const getPicture = (purpose) => {
    return pictures.hasOwnProperty(purpose) ? pictures[purpose].url : ''
  }

  return (
    <div className='pages__container'>
      <h2>{t('Pictures')}</h2>
      <ListSubheader className="my-3" component="div">{t('Online booking picture')}</ListSubheader>
      <div className="row">
        <div className="col-md-6 mb-3">
          <PictureUploadButton name="online_booking_picture" onChange={e => {onChange(e)}}/>
        </div>
        <div className="col-md-6 mb-3">
          <img className="added_picture" src={getPicture('online_booking_picture')} />
        </div>
      </div>
    </div>
  )
}
