import React, {useEffect, useState} from "react";
import  './Register.scss';
import { useTranslation } from 'react-i18next';
import {Select, TextField, MenuItem, InputLabel, FormControl, Button, Autocomplete} from "@mui/material";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import {useSearchParams} from "react-router-dom";
import {defaultPageRedirect} from "../../../helper";

export default function Register() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [firstNameError, setFirstNameError] = useState([])
  const [lastNameError, setLastNameError] = useState([])
  const [emailError, setEmailError] = useState([])
  const [phoneError, setPhoneError] = useState([])
  const [passwordError, setPasswordError] = useState([])
  const [place, setPlace] = useState('1')
  const [placeNameError, setPlaceNameError] = useState([])
  const [placeName, setPlaceName] = useState([])
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [placePhone, setPlacePhone] = useState('')
  const [placeEmail, setPlaceEmail] = useState('')
  const [homePage, setHomePage] = useState('')
  const [countries,setCountries] = useState([])
  const [countryId,setCountryId] = useState('')
  const [language,setLanguage] = useState('')
  const [taxNumber,setTaxNumber] = useState('')
  const [organizationName, setOrganizationName] = useState('')

  const [searchParams, setSearchParams] = useSearchParams();


  useEffect(() => {
    axios.get(`${process.env.MIX_API_URL}/api/countries`).then(response => {
      setCountries(response.data.map(i => ({label: i.name, id: i.id})))
    }).catch(error => {
    })
  },[])

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(process.env.MIX_API_URL+'/api/register', {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      password: password,
      password_confirmation: passwordConfirmation,
      language: localStorage.getItem('i18nextLng')
    }).then(response => {
      localStorage.setItem('token',response.data.token)
      if(place === '1'){
        axios.post(process.env.MIX_API_URL+'/api/places', {
          name: placeName,
          address: address,
          city: city,
          zip_code: zipCode,
          phone: placePhone,
          email: placeEmail,
          home_page: homePage,
          country_id: countryId,
          tax_number: taxNumber,
          organization_name: organizationName,
          language: language
        },{
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          localStorage.setItem('place_id',response.data.id)
          defaultPageRedirect()
        }).catch(error => {})
      }else{
        defaultPageRedirect()
      }
    }).catch(error => {
      setFirstNameError([])
      setLastNameError([])
      setEmailError([])
      setPhoneError([])
      setPasswordError([])
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          if(key === 'first_name') setFirstNameError(value)
          if(key === 'last_name') setLastNameError(value)
          if(key === 'email') setEmailError(value)
          if(key === 'phone') setPhoneError(value)
          if(key === 'password') setPasswordError(value)
        }
        console.log(error.response.data.errors)
      } else {
        setPasswordError([error.message])
        console.log('Error', error.message)
      }
    })
  }

  const onChange = (e) => {
    switch (e.target.name) {
      case 'email':
        setEmail(e.target.value)
        break;
      case 'phone':
        setPhone(e.target.value)
        break;
      case 'password':
        setPassword(e.target.value)
        break;
      case 'first_name':
        setFirstName(e.target.value)
        break;
      case 'last_name':
        setLastName(e.target.value)
        break;
      case 'password_confirmation':
        setPasswordConfirmation(e.target.value)
        break;
      case 'place_id':
        setPlace(e.target.value)
        break;
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
      case 'place_phone':
        setPlacePhone(e.target.value)
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
    <div className='pages__container'>
      <h1 className="mt-4 text-center">{t('Sign up')}</h1>
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <TextField label={t('First name')} size="small" fullWidth
                           type="text" id="first_name" name="first_name"
                           onChange={onChange}
                           error={firstNameError.length > 0}
                           helperText={
                             <>{firstNameError.map(el => {return t(el)})}</>
                           }/>
              </div>
              <div className="mb-3">
                <TextField label={t('Last name')} size="small" fullWidth
                           type="text" id="last_name" name="last_name"
                           onChange={onChange}
                           error={lastNameError.length > 0}
                           helperText={
                             <>{lastNameError.map(el => {return t(el)})}</>
                           }/>
              </div>
              <div className="mb-3">
                <TextField label={t('Email address')} size="small" fullWidth
                           type="email" id="email" name="email"
                           onChange={onChange}
                           error={emailError.length > 0}
                           helperText={
                             <>{emailError.map(el => {return t(el)})}</>
                           }/>
              </div>
              <div className="mb-3">
                <PhoneInput
                  country={'dk'}
                  value={phone}
                  onChange={phone => setPhone('+'+phone)}
                  containerClass="phone-input"
                />
              </div>
              <div className="mb-3">
                <TextField label={t('Password')} size="small" fullWidth
                           type="password" id="password" name="password"
                           onChange={onChange}
                           error={passwordError.length > 0}
                           helperText={
                             <>{passwordError.map(el => {return t(el)})}</>
                           }/>
              </div>
              <div className="mb-3">
                <TextField label={t('Password confirmation')} size="small" fullWidth
                           type="password" id="password_confirmation" name="password_confirmation"
                           onChange={onChange}/>
              </div>
              <hr/>
              {!searchParams.get('invitation') &&
                <div className="mb-3">
                  <FormControl size="small" fullWidth>
                    <InputLabel id="label_place_id">{t('Restaurant')}</InputLabel>
                    <Select label={t('Restaurant')} value={place}
                            labelId="label_place_id" id="place_id" name="place_id"
                            onChange={onChange}>
                      <MenuItem value="1">{t('Restaurant Registration')}</MenuItem>
                      <MenuItem value="0">{t('Waiter Registration')}</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              }
              {place === '1' &&
              <>
                <div className="mb-3">
                  <TextField label={t('Organization Name')} size="small" fullWidth
                             type="text" id="organization_name" name="organization_name"
                             onChange={onChange}
                             />
                </div>
                <div className="mb-3">
                  <TextField label={t('Restaurant Name')} size="small" fullWidth
                             type="text" id="place_name" name="place_name"
                             onChange={onChange}
                             error={placeNameError.length > 0}
                             helperText={
                               <>{placeNameError.map(el => {return t(el)})}</>
                             }/>
                </div>
                <div className="mb-3">
                  <TextField label={t('Restaurant Address')} size="small" fullWidth
                             type="text" id="address" name="address"
                             onChange={onChange}/>
                </div>
                <div className="mb-3">
                  <TextField label={t('Restaurant City')} size="small" fullWidth
                             type="text" id="city" name="city"
                             onChange={onChange}/>
                </div>
                <div className="mb-3">
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
                        label={t('Restaurant Country')}
                        placeholder={t('Restaurant Country')}
                      />
                    }
                    value={currentCountryLabel()}
                  />
                </div>
                <div className="mb-3">
                  <TextField label={t('Restaurant Zip code')} size="small" fullWidth
                             type="text" id="zip_code" name="zip_code"
                             onChange={onChange}/>
                </div>
                <div className="mb-3">
                  <PhoneInput
                    country={'dk'}
                    value={placePhone}
                    onChange={phone => setPlacePhone('+'+phone)}
                    containerClass="phone-input"
                  />
                </div>
                <div className="mb-3">
                  <TextField label={t('Restaurant Email address')} size="small" fullWidth
                             type="email" id="place_email" name="place_email"
                             onChange={onChange}/>
                </div>
                <div className="mb-3">
                  <TextField label={t('Restaurant Tax number')} size="small" fullWidth
                             type="text" id="tax_number" name="tax_number"
                             required={true}
                             onChange={onChange}/>
                </div>
                <div className="mb-3">
                  <FormControl size="small" fullWidth>
                    <InputLabel id="label_language">{t('Restaurant Language')}</InputLabel>
                    <Select label={t('Restaurant Language')}
                            labelId="label_language" id="language" name="language"
                            onChange={onChange}>
                      {window.langs.map((lang,key) => {
                        return <MenuItem key={key} value={lang.lang}>{lang.title}</MenuItem>
                      })}
                    </Select>
                  </FormControl>
                </div>
                <div className="mb-3">
                  <TextField label={t('Restaurant Home page')} size="small" fullWidth
                             type="text" id="home_page" name="home_page"
                             onChange={onChange}/>
                </div>
              </>
              }
              <Button variant="contained" type="submit">{t('Create profile')}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
