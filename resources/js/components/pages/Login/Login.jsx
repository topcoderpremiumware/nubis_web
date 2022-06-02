import React, {useState} from "react";
import  './Login.scss';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState([])
  const [passwordError, setPasswordError] = useState([])

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(process.env.APP_URL+'/api/login', {
      email: email,
      password: password
    }).then(response => {
      localStorage.setItem('token',response.data.token)
      axios.get(process.env.APP_URL+'/api/places/mine', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        if(response.data.length > 0){
          localStorage.setItem('place_id', response.data[0].id)
        }
        window.location.href = "/"
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
                <label htmlFor="email" className="form-label">{t('Email address')}</label>
                <input onChange={onChange} required type="email"
                       className={`form-control ${emailError.length > 0 ? 'is-invalid' : ''}`}
                       name="email" id="email"/>
                {emailError.length > 0 &&
                  <>{emailError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                }
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">{t('Password')}</label>
                <input onChange={onChange} required type="password"
                       className={`form-control ${passwordError.length > 0 ? 'is-invalid' : ''}`}
                       name="password" id="password"/>
                {passwordError.length > 0 &&
                  <>{passwordError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                }
              </div>
              <button type="submit" className="btn btn-primary">{t('Sign in')}</button>
            </form>
            <hr/>
            <Link to="/register" className="btn btn-primary">{t('Create profile')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
