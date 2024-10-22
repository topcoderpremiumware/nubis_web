import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import eventBus from "../../../eventBus";
import {Button, Grid, Stack, TextField} from "@mui/material";
import {simpleCatchError} from "../../../helper";

export default function SingSettings() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [pass, setPass] = useState(null);

  useEffect(() => {
    getData()
    eventBus.on("placeChanged", () => {
      getData()
    })
  },[])

  const onChange = (e) => {
    if(e.target.files && e.target.files.length > 0) setFile(e.target.files[0])
    if(e.target.name === 'password') setPass(e.target.value)
  }

  const onSave = (e) => {
    let formData = new FormData()
    formData.append('place_id', localStorage.getItem('place_id'))
    formData.append('file', file)
    formData.append('pass', pass)
    axios.post(`${process.env.MIX_API_URL}/api/save_key`, formData,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setFile(null)
      setPass(null)
      getData()
      eventBus.dispatch("notification", {type: 'success', message: 'Settings saved'});
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const getData = () => {
    axios.get(`${process.env.MIX_API_URL}/api/has_key`,{
      params: {
        place_id: localStorage.getItem('place_id'),
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setData(response.data)
    }).catch(error => {
      setData(null)
    })
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Sign Settings')}</h2>
      </Stack>
      <Grid container>
        <Grid item xs={12} md={6} sx={{mb:3}}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Button variant="contained" component="label">
              {t('Upload Key')}
              <input hidden accept=".p12" name="file" onChange={onChange} type="file"/>
            </Button>
            <div>{data?.file ? t('Already set') : t('Not yet set')}</div>
          </Stack>
          <TextField label={t('Password')} size="small" fullWidth className="my-3"
                     type="text" id="password" name="password"
                     onChange={onChange}
                     value={pass || ''}
                     helperText={data?.pass ? t('Already set') : t('Not yet set')}
          />
          <Button variant="contained" onClick={onSave}>{t('Save')}</Button>
        </Grid>
      </Grid>
    </div>
  )
}
