import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import {TextField, Button} from "@mui/material";
import eventBus from "../../../eventBus";

export default function PasswordReset() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('')
  const [type, setType] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setType(urlParams.get('type'))
    setEmail(urlParams.get('email'))
    setToken(urlParams.get('token'))
  },[])

  const onSubmit = (e) => {
    e.preventDefault();
    let url = type === 'customer' ? `${process.env.MIX_API_URL}/api/customers/reset_password` : `${process.env.MIX_API_URL}/api/reset_password`
    axios.post(url, {
      email: email,
      token: token,
      password: password,
      password_confirmation: passwordConfirmation
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: "Password changed successfully"});
    }).catch(error => {
      eventBus.dispatch("notification", {type: 'error', message: error.response.data.message});
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'password'){
      setPassword(e.target.value)
    }
    if(e.target.name === 'password_confirmation'){
      setPasswordConfirmation(e.target.value)
    }
  }

  return (
    <div className='pages__container'>
      <h1 className="mt-4 text-center">{t('Reset password')}</h1>
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <TextField label={t('Password')} size="small" fullWidth
                           type="password" id="password" name="password"
                           onChange={onChange}/>
              </div>
              <div className="mb-3">
                <TextField label={t('Password confirmation')} size="small" fullWidth
                           type="password" id="password_confirmation" name="password_confirmation"
                           onChange={onChange}/>
              </div>
              <Button variant="contained" type="submit">{t('Submit')}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
