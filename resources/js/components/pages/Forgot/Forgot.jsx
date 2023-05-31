import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import {TextField, Button} from "@mui/material";
import eventBus from "../../../eventBus";

export default function Forgot() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setType(urlParams.get('type'))
  },[])

  const onSubmit = (e) => {
    e.preventDefault();
    let url = type === 'customer' ? `${process.env.MIX_API_URL}/api/customers/forgot_password` : `${process.env.MIX_API_URL}/api/forgot_password`
    axios.post(url, {
      email: email
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: response.data.message});
    }).catch(error => {
      eventBus.dispatch("notification", {type: 'error', message: error.response.data.message});
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'email'){
      setEmail(e.target.value)
    }
  }

  return (
    <div className='pages__container'>
      <h1 className="mt-4 text-center">{t('Forgot password')}</h1>
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <TextField label={t('Email address')} required size="small" fullWidth
                  type="email" id="email" name="email"
                  onChange={onChange}
                  />
              </div>
              <Button variant="contained" type="submit">{t('Submit')}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
