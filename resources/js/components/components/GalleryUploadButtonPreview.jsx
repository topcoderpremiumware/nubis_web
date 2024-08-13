import * as React from 'react';
import Button from '@mui/material/Button';
import {useTranslation} from "react-i18next";
import {IconButton, Stack} from "@mui/material";
import {useEffect, useState} from "react";
import DeleteIcon from '@mui/icons-material/Delete';

export default function GalleryUploadButtonPreview(props) {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);

  useEffect(() => {
    setImages(props.src)
  },[props])

  useEffect(() => {
    console.log('images',images)
  },[images])

  return (
    <Stack spacing={1} direction="column">
      <Stack style={{gap:'8px'}} direction="row" alignItems="center" flexWrap="wrap">
      {images.length > 0 && images.map((image,key) => {
        return <div key={key} style={{position: 'relative'}}>
          {(image.hasOwnProperty('id') && props.hasOwnProperty('onDelete')) &&
            <IconButton  style={{position: 'absolute',right: 0, top: 0}} onClick={e => { props.onDelete(image.id) }} size="small">
            <DeleteIcon fontSize="small"/>
          </IconButton>}
          <img src={image.url} alt="" style={{width: '200px'}}/>
        </div>
      })}
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center">
        <Button variant="contained" component="label">
          {t('Upload')}
          <input hidden accept="image/*" name={props.name} onChange={e => {
            if(e.target.files.length > 0) setImages(Object.values(e.target.files).map(el => ({url: URL.createObjectURL(el)})))
            props.onChange(e)
          }} type="file" multiple />
        </Button>
        <div>{t('Maximum upload file size: 1MB')}</div>
      </Stack>
    </Stack>
  )
}
