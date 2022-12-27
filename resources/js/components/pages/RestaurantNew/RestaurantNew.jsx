import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import axios from 'axios';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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

  useEffect(() => {
    axios.get(`${process.env.APP_URL}/api/countries`).then(response => {
      setCountries(response.data)
    }).catch(error => {
    })
  }, [])

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(process.env.APP_URL + '/api/places', {
      name: placeName,
      address: address,
      city: city,
      zip_code: zipCode,
      phone: phone,
      email: placeEmail,
      home_page: homePage,
      country_id: countryId
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      localStorage.setItem('place_id', response.data.id)
      window.location.href = "/"
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
    }
  }

  return (
    <div className="pages__container">
      <h2>{t('Create new restaurant')}</h2>
      
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <TextField label={t('Name')} size="small" fullWidth
            type="text" id="place_name" name="place_name"
            onChange={onChange} />
        </div>
        <div className="mb-3">
          <TextField label={t('Address')} size="small" fullWidth
            type="text" id="address" name="address"
            onChange={onChange} />
        </div>
        <div className="mb-3">
          <TextField label={t('City')} size="small" fullWidth
            type="text" id="city" name="city"
            onChange={onChange} />
        </div>
        <div className="mb-3">
          <FormControl size="small" fullWidth>
            <InputLabel id="label_country_id">{t('Country')}</InputLabel>
            <Select label={t('Country')} value={countryId}
              labelId="label_country_id" id="country_id" name="country_id"
              onChange={onChange}>
              {countries.map((c, key) => {
                return <MenuItem key={key} value={c.id}>{c.name}</MenuItem>
              })}
            </Select>
          </FormControl>
        </div>
        <div className="mb-3">
          <TextField label={t('Zip code')} size="small" fullWidth
            type="text" id="zip_code" name="zip_code"
            onChange={onChange} />
        </div>
        <div className="mb-3">
          <TextField label={t('Phone')} size="small" fullWidth
            type="text" id="phone" name="phone"
            onChange={onChange} />
        </div>
        <div className="mb-3">
          <TextField label={t('Email address')} size="small" fullWidth
            type="email" id="place_email" name="place_email"
            onChange={onChange} />
        </div>
        <div className="mb-3">
          <TextField label={t('Home page')} size="small" fullWidth
            type="text" id="home_page" name="home_page"
            onChange={onChange} />
        </div>
        <Button variant="contained" type="submit">{t('Create new')}</Button>
      </form>
    </div>
  )
}

export default RestaurantNew