import * as React from 'react';
import Button from '@mui/material/Button';
import {useTranslation} from "react-i18next";

export default function PictureUploadButton(props) {
  const { t } = useTranslation();

  return (
    <Button variant="contained" component="label">
      {t('Upload')}
      <input hidden accept="image/*" name={props.name} onChange={e => {props.onChange(e)}} type="file" />
    </Button>
  )
}
