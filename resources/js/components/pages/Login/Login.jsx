import React, {useState} from "react";
import  './Login.scss';
import { useTranslation } from 'react-i18next';
import {TextField, Button, Stack} from "@mui/material";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState([])
  const [passwordError, setPasswordError] = useState([])

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(process.env.MIX_API_URL+'/api/login', {
      email: email,
      password: password
    }).then(response => {
      localStorage.setItem('token',response.data.token)
      axios.get(process.env.MIX_API_URL+'/api/places/mine', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        if(response.data.length > 0){
          localStorage.setItem('place_id', response.data[0].id)
        }
        if(localStorage.getItem('place_id')){
          window.location.href = "/admin/DayView"
        }else{
          window.location.href = "/admin"
        }
      }).catch(error => {})
    }).catch(error => {
      setEmailError([])
      setPasswordError([])
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          if(key === 'email') setEmailError(value)
          if(key === 'password') setPasswordError(value)
        }
      }else if(error.response.status === 401){
        setPasswordError(['Authorization error'])
      } else {
        setPasswordError([error.message])
        console.log('Error', error.message)
      }
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'email'){
      setEmail(e.target.value)
    }
    if(e.target.name === 'password'){
      setPassword(e.target.value)
    }
  }

  return (
    <div className='pages__container'>
      <h1 className="mt-4 text-center">{t('Sign in')}</h1>
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <TextField label={t('Email address')} required size="small" fullWidth
                  type="email" id="email" name="email"
                  onChange={onChange}
                  error={emailError.length > 0}
                  helperText={
                    <>{emailError.map(el => {return t(el)})}</>
                  }/>
              </div>
              <div className="mb-3">
                <TextField label={t('Password')} required size="small" fullWidth
                           type="password" id="password" name="password"
                           onChange={onChange}
                           error={passwordError.length > 0}
                           helperText={
                             <>{passwordError.map(el => {return t(el)})}</>
                           }/>
              </div>
              <Button variant="contained" type="submit">{t('Sign in')}</Button>
            </form>
            <hr/>
            <Stack spacing={2} sx={{mt: 2}} direction="row">
              <Button sx={{ display: { xl: 'block', xs: 'none' } }} variant="contained" href="/admin/register">{t('Create profile')}</Button>
              <Button variant="contained" href="/admin/forgot">{t('Forgot password?')}</Button>
            </Stack>
          </div>
        </div>
      </div>
    </div>
  );
};
