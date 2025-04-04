import {Button, FormControl, Stack, InputLabel, MenuItem, Select, TextField, Grid, Autocomplete} from '@mui/material'
import axios from 'axios';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import '../Register/Register.scss'
import {defaultPageRedirect} from "../../../helper";

const RestaurantNew = () => {
  const { t } = useTranslation();
  const [placeName, setPlaceName] = useState([])
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [placeEmail, setPlaceEmail] = useState('')
  const [homePage, setHomePage] = useState('')
  const [countries, setCountries] = useState([])
  const [countryId, setCountryId] = useState('')
  const [language, setLanguage] = useState('')
  const [taxNumber,setTaxNumber] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [hasOrganization,setHasOrganization] = useState(false)

  useEffect(() => {
    getCurrentPlace()
    axios.get(`${process.env.MIX_API_URL}/api/countries`).then(response => {
      setCountries(response.data.map(i => ({label: i.name, id: i.id})))
    }).catch(error => {
    })
  }, [])

  const getCurrentPlace = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}`).then(response => {
      if(response.data.organization_id){
        setHasOrganization(true)
      }
    }).catch(error => {
    })
  }

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(process.env.MIX_API_URL + '/api/places', {
      name: placeName,
      address: address,
      city: city,
      zip_code: zipCode,
      phone: phone,
      email: placeEmail,
      home_page: homePage,
      country_id: countryId,
      tax_number: taxNumber,
      organization_name: organizationName,
      language: language
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      localStorage.setItem('place_id', response.data.id)
      defaultPageRedirect()
    }).catch(error => { })
  }

  const onChange = (e) => {
    switch (e.target.name) {
      case 'place_name':
        setPlaceName(e.target.value)
        break;
      case 'address':
        setAddress(e.target.value)
        break;
      case 'city':
        setCity(e.target.value)
        break;
      case 'zip_code':
        setZipCode(e.target.value)
        break;
      case 'phone':
        setPhone(e.target.value)
        break;
      case 'place_email':
        setPlaceEmail(e.target.value)
        break;
      case 'home_page':
        setHomePage(e.target.value)
        break;
      case 'country_id':
        setCountryId(e.target.value)
        break;
      case 'language':
        setLanguage(e.target.value)
        break;
      case 'language':
        setLanguage(e.target.value)
        break;
      case 'tax_number':
        setTaxNumber(e.target.value)
        break;
      case 'organization_name':
        setOrganizationName(e.target.value)
        break;
    }
  }

  const currentCountryLabel = () => {
    let cl = countries.find((el) => el.id == countryId)
    if(cl){
      return cl.label
    }else{
      return null
    }
  }

  return (
    <Grid className="pages__container">
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Create new restaurant')}</h2>
      </Stack>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2} sx={{pb: 2, mt: 3}}>
          {!hasOrganization && <Grid item xs={12} sm={6}>
            <TextField label={t('Organization Name')} size="small" fullWidth
                       type="text" id="organization_name" name="organization_name"
                       onChange={onChange} />
          </Grid>}
          <Grid item xs={12} sm={6}>
            <TextField label={t('Name')} size="small" fullWidth
              type="text" id="place_name" name="place_name"
              onChange={onChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Address')} size="small" fullWidth
              type="text" id="address" name="address"
              onChange={onChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('City')} size="small" fullWidth
              type="text" id="city" name="city"
              onChange={onChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              disablePortal
              disableClearable
              id="label_country_id"
              options={countries}
              renderOption={(props, option) => (
                <li {...props}>{option.label}</li>
              )}
              size="small"
              onChange={(event, newValue) => {
                setCountryId(newValue.id)
              }}
              renderInput={(params) =>
                <TextField
                  {...params}
                  label={t('Country')}
                  placeholder={t('Country')}
                />
              }
              value={currentCountryLabel()}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Zip code')} size="small" fullWidth
              type="text" id="zip_code" name="zip_code"
              onChange={onChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <PhoneInput
              country={'dk'}
              value={phone}
              onChange={phone => setPhone('+'+phone)}
              containerClass="phone-input"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Email address')} size="small" fullWidth
              type="email" id="place_email" name="place_email"
              onChange={onChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Tax number')} size="small" fullWidth
                       type="text" id="tax_number" name="tax_number"
                       required={true}
                       onChange={onChange}/>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_language">{t('Language')}</InputLabel>
              <Select label={t('Language')}
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
              onChange={onChange} />
          </Grid>
        </Grid>
        <Button variant="contained" type="submit">{t('Create new')}</Button>
      </form>
    </Grid>
  )
}

export default RestaurantNew
