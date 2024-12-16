import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {Button, Grid, Stack} from "@mui/material";
import eventBus from "../../../eventBus";
import Box from "@mui/material/Box";

export default function QZSettings() {
  const { t } = useTranslation();
  const [cert, setCert] = useState()
  const [key, setKey] = useState()

  useEffect(() => {

  },[])

  const onChange = (e) => {
    if(e.target.name === 'cert') setCert(e.target.files[0])
    if(e.target.name === 'key') setKey(e.target.files[0])
  }

  const onSave = (e) => {
    if(key) saveFile('qz_key',key)
    if(cert) saveFile('qz_cert',cert)
  }

  const saveFile = (name,file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      localStorage.setItem(name, event.target.result)
      eventBus.dispatch("notification", {type: 'success', message: 'Saved successfully'})
    };
    reader.readAsText(file)
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('QZ Settings')}</h2>
      </Stack>
      <Grid container>
        <Grid item xs={12} md={6} sx={{mb:3}}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Button variant="contained" component="label">
              {t('Upload Cert')}
              <input hidden accept=".txt" name="cert" onChange={onChange} type="file"/>
            </Button>
            <div>{localStorage.getItem("qz_cert") ? t('Already set') : t('Not yet set')}</div>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} sx={{mb:3}}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Button variant="contained" component="label">
              {t('Upload Key')}
              <input hidden accept=".pem" name="key" onChange={onChange} type="file"/>
            </Button>
            <div>{localStorage.getItem("qz_key") ? t('Already set') : t('Not yet set')}</div>
          </Stack>
        </Grid>
      </Grid>
      <Button variant="contained" onClick={onSave}>{t('Save')}</Button>
      <Box sx={{mt:3}}>
        <p>Instruction:
          <ol>
            <li>Go to the <a href="https://qz.io/download/">https://qz.io/download/</a>, download app and install it.</li>
            <li>A printer icon will appear next to the date and time on the main menu bar of the operating system. Click on it in the menu and select Advanced -> Site manager...</li>
            <li>In the open window, press the blue "+" button, then "Create new". Then agree to all the questions. After the questions, a folder with two files will open. The folder is on the desktop. There are two files in this folder: .txt is the certificate and .pem is the key.</li>
            <li>These files must be uploaded to the form above.</li>
          </ol>
        </p>
      </Box>
    </div>
  )
}
