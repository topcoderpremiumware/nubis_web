import React, {useState} from "react";
import  './Login.scss';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(process.env.APP_URL+'/api/login', {
      email: email,
      password: password
    }).then(response => {
      localStorage.setItem('token',response.data.token)
      window.location.href="/"
    }).catch(e => {
      console.log('login error: ',e)
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
                <label htmlFor="email" className="form-label">{t('Email address')}</label>
                <input onChange={onChange} type="email" className="form-control" name="email" id="email"/>
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">{t('Password')}</label>
                <input onChange={onChange} type="password" className="form-control" name="password" id="password"/>
              </div>
              <button type="submit" className="btn btn-primary">{t('Sign in')}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
