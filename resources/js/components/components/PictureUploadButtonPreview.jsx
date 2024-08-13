import * as React from 'react';
import Button from '@mui/material/Button';
import {useTranslation} from "react-i18next";
import {Stack} from "@mui/material";
import {useEffect, useState} from "react";
import eventBus from "../../eventBus";

export default function PictureUploadButtonPreview(props) {
  const { t } = useTranslation();
  const [image, setImage] = useState('');

  useEffect(() => {
    setImage(props.src)
  },[props])

  return (
    <Stack spacing={1} direction="column">
      <img src={image} alt="" style={{width:'200px'}}/>
      <Stack spacing={1} direction="row" alignItems="center">
        <Button variant="contained" component="label">
          {t('Upload')}
          <input hidden accept="image/*" name={props.name} onChange={e => {
            if(e.target.files.length > 0) setImage(URL.createObjectURL(e.target.files[0]))
            props.onChange(e)
          }} type="file" />
        </Button>
        <div>{t('Maximum upload file size: 1MB')}</div>
      </Stack>
    </Stack>
  )
}
