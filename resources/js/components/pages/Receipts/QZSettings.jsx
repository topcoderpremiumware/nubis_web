import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {Button, Grid, Stack, TextField} from "@mui/material";
import eventBus from "../../../eventBus";
import Box from "@mui/material/Box";

export default function QZSettings() {
  const { t } = useTranslation();
  const [cert, setCert] = useState()
  const [key, setKey] = useState()
  const [printServerIp, setPrintServerIp] = useState(localStorage.getItem("qz_print_server_ip"))

  useEffect(() => {

  },[])

  const onChange = (e) => {
    if(e.target.name === 'cert') setCert(e.target.files[0])
    if(e.target.name === 'key') setKey(e.target.files[0])
    if(e.target.name === 'print_server_ip') setPrintServerIp(e.target.value)
  }

  const onSave = (e) => {
    if(key) saveFile('qz_key',key)
    if(cert) saveFile('qz_cert',cert)
    localStorage.setItem('qz_print_server_ip', printServerIp)
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
        <Grid item xs={12} md={6} sx={{mb:3}}>
          <TextField label={t('Print server IP')} size="small" fullWidth
                     type="text" id="print_server_ip" name="print_server_ip"
                     onChange={onChange}
                     value={printServerIp}
          />
        </Grid>
      </Grid>
      <Button variant="contained" onClick={onSave}>{t('Save')}</Button>
      <Box sx={{mt: 3}}>
        <p>Instruction for desktop:
          <ol>
            <li>Go to the <a href="https://qz.io/download/">https://qz.io/download/</a>, download app and install it.
            </li>
            <li>A printer icon will appear next to the date and time on the main menu bar of the operation system. Click
              on it in the menu and select Advanced -> Site manager...
            </li>
            <li>In the open window, press the blue "+" button, then "Create new". Then agree to all the questions. After
              the questions, a folder with two files will open. The folder is on the desktop. There are two files in
              this folder: .txt is the certificate and .pem is the key.
            </li>
            <li>These files must be uploaded to the form above.</li>
          </ol>
        </p>

        <p>Instruction for mobile (<a href="https://qz.io/docs/print-server">https://qz.io/docs/print-server</a>):
          <ol>
            <li>The settings described in "Instruction for desktop" section must be made on a specific desktop in the local network. It will act as a Print server.</li>
            <li>You need to copy the certificate and key files that were generated on the desktop to the phone.</li>
            <li>You need to find out the IP address of the desktop in the local network and enter it on the phone in the form above in the Print server IP field.</li>
            <li>Also, in the same way as for desktop, you need to add the certificate and key files to the form for mobile. These should be the same keys, new ones do not need to be generated for mobile.</li>
          </ol>
        </p>
      </Box>
    </div>
  )
}
