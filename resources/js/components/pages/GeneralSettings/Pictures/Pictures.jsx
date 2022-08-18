import React, {useState} from 'react';
import PictureUploadButton from './PictureUploadButton';
import {useTranslation} from "react-i18next";
import ListSubheader from "@mui/material/ListSubheader";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

export default function Pictures() {
  const { t } = useTranslation();

  const [pictures, setPictures] = useState({});

  const onChange = (e) => {
    console.log(e.target.name,e.target.value)
  }

  const getPicture = (purpose) => {
    return pictures.hasOwnProperty(purpose) ? pictures[purpose] : ''
  }

  return (
    <div className='pages__container'>
      <h2>{t('Pictures')}</h2>
      <ListSubheader className="my-3" component="div">{t('Online booking picture')}</ListSubheader>
      <div className="row">
        <div className="col-md-6">
          <PictureUploadButton name="online_booking_picture" onChange={e => {onChange(e)}}/>
        </div>
        <div className="col-md-6">
          <img className="added_picture" src={getPicture('online_booking_picture')} />
        </div>
      </div>
    </div>
  )
}
