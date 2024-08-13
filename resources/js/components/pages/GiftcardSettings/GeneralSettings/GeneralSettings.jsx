import React, {useEffect, useState} from 'react';
import PictureUploadButtonPreview from '../../../components/PictureUploadButtonPreview';
import {useTranslation} from "react-i18next";
import ListSubheader from "@mui/material/ListSubheader";
import eventBus from "../../../../eventBus";
import {Stack} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import GalleryUploadButtonPreview from "../../../components/GalleryUploadButtonPreview";
import axios from "axios";

export default function GeneralSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pictures, setPictures] = useState([]);

  useEffect(() => {
    getPictures()
    eventBus.on("placeChanged", () => {
      getPictures()
    })
  },[])

  const onChange = (e) => {
    if(e.target.files && e.target.files.length > 0){
      let formData = new FormData()
      formData.append('place_id', localStorage.getItem('place_id'))
      let url
      if(e.target.name === 'giftcard_gallery'){
        url = `${process.env.MIX_API_URL}/api/files_many/${e.target.name}`
        for (const file of e.target.files) {
          formData.append('files[]', file)
        }
      }else{
        url = `${process.env.MIX_API_URL}/api/files/${e.target.name}`
        formData.append('file', e.target.files[0])
      }
      axios.post(url, formData,{
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
      e.target.value = null;
    }
  }

  const onImageDelete = (id) => {
    if (window.confirm(t('Are you sure you want to delete this image?'))) {
      axios.delete(process.env.MIX_API_URL + '/api/files/' + id, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        getPictures()
        eventBus.dispatch("notification", {type: 'success', message: 'Image deleted successfully'});
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
  }

  const getPictures = () => {
    axios.get(`${process.env.MIX_API_URL}/api/files_many_purposes`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        purposes: ['giftcard_on_amount','giftcard_on_experience','giftcard_gallery'],
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

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Giftcard Settings')}</h2>
      </Stack>
      <ListSubheader className="my-3" component="div">{t('Picture for giftcard on amount')}</ListSubheader>
      <PictureUploadButtonPreview
        name="giftcard_on_amount"
        src={getPicture('giftcard_on_amount')}
        onChange={e => {onChange(e)}}/>
      <ListSubheader className="my-3" component="div">{t('Picture for giftcard on experience')}</ListSubheader>
      <PictureUploadButtonPreview
        name="giftcard_on_experience"
        src={getPicture('giftcard_on_experience')}
        onChange={e => {onChange(e)}}/>
      <ListSubheader className="my-3" component="div">{t('Pictures for giftcard gallery')}</ListSubheader>
      <GalleryUploadButtonPreview
        name="giftcard_gallery"
        src={getPicture('giftcard_gallery',true) || []}
        onDelete={id => {onImageDelete(id)}}
        onChange={e => {onChange(e)}}/>
    </div>
  )
}
