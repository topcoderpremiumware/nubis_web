import * as React from 'react';
import Button from '@mui/material/Button';
import {useTranslation} from "react-i18next";
import {Stack} from "@mui/material";

export default function PictureUploadButton(props) {
  const { t } = useTranslation();

  return (
    <Stack spacing={1} direction="row" alignItems="center">
      <Button variant="contained" component="label">
        {t('Upload')}
        <input hidden accept="image/*" name={props.name} onChange={e => {props.onChange(e)}} type="file" />
      </Button>
      <div>{t('Maximum upload file size: 1MB')}</div>
    </Stack>
  )
}
