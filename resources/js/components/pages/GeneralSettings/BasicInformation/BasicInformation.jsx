import React, {useEffect, useState} from 'react';
import './BasicInformation.scss';
import {useTranslation} from "react-i18next";
import {Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField} from "@mui/material";
import eventBus from "../../../../eventBus";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import '../../Register/Register.scss'

export default function BasicInformation() {
  const { t } = useTranslation();
  const [place, setPlace] = useState({})
  const [countries,setCountries] = useState([])

  useEffect(() => {
    getCountries()
    getPlace()
    eventBus.on("placeChanged", () => {
      getPlace()
    })
  },[])

  const getPlace = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}`).then(response => {
      setPlace(response.data)
    }).catch(error => {
    })
  }

  const getCountries = () => {
    axios.get(`${process.env.MIX_API_URL}/api/countries`).then(response => {
      setCountries(response.data)
    }).catch(error => {
    })
  }

  const onChange = (e) => {
    setPlace(prev => ({...prev, [e.target.name]: e.target.value}))
  }

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}`, place).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Information saved'});
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

  const deletePlace = () => {
    if (window.confirm(t('Are you sure you want to delete this place?'))) {
      axios.delete(process.env.MIX_API_URL + '/api/places/' + place.id, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        eventBus.dispatch("notification", {type: 'success', message: 'Place deleted successfully'});
        localStorage.removeItem("place_id")
        window.location.href = "/admin"
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
  }

  return (
    <div className='pages__container'>
      <h2>{t('Basic Information')}</h2>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2} sx={{pb: 2, mt: 3}}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Name')} size="small" fullWidth
                       type="text" id="name" name="name" required
                       onChange={onChange} value={place.name || ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Address')} size="small" fullWidth
                       type="text" id="address" name="address"
                       onChange={onChange} value={place.address || ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('City')} size="small" fullWidth
                       type="text" id="city" name="city"
                       onChange={onChange} value={place.city || ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_country_id">{t('Country')}</InputLabel>
              <Select label={t('Country')} value={place.country_id || 0}
                      labelId="label_country_id" id="country_id" name="country_id"
                      onChange={onChange}>
                {countries.map((c,key) => {
                  return <MenuItem key={key} value={c.id}>{c.name}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Zip code')} size="small" fullWidth
                       type="text" id="zip_code" name="zip_code"
                       onChange={onChange} value={place.zip_code || ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <PhoneInput
              country={'dk'}
              value={place.phone}
              onChange={phone => setPlace(prev => ({ ...prev, phone: '+'+phone }))}
              containerClass="phone-input"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Email')} size="small" fullWidth
                       type="email" id="email" name="email"
                       onChange={onChange} value={place.email || ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Tax number')} size="small" fullWidth
                       type="text" id="tax_number" name="tax_number"
                       required={true}
                       onChange={onChange} value={place.tax_number || ''}/>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_language">{t('Booking page language')}</InputLabel>
              <Select label={t('Booking page language')} value={place.language || ''}
                      labelId="label_language" id="language" name="language"
                      onChange={onChange}>
                {window.langs.map((lang,key) => {
                  return <MenuItem key={key} value={lang.lang}>{lang.title}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Home page')} size="small" fullWidth
                       type="text" id="home_page" name="home_page"
                       onChange={onChange} value={place.home_page || ''}
            />
          </Grid>
        </Grid>
        <Stack spacing={2} sx={{mt: 2}} direction="row">
          <Button variant="contained" type="submit">{t('Save')}</Button>
          <Button variant="contained" type="button" color="error" onClick={deletePlace}>{t('Delete')}</Button>
        </Stack>
      </form>
    </div>
  )
}
