import React, {useEffect, useState} from "react";
import  './Register.scss';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Register() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [firstNameError, setFirstNameError] = useState([])
  const [lastNameError, setLastNameError] = useState([])
  const [emailError, setEmailError] = useState([])
  const [passwordError, setPasswordError] = useState([])
  const [place, setPlace] = useState(0)
  const [placeNameError, setPlaceNameError] = useState([])
  const [placeName, setPlaceName] = useState([])
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [placeEmail, setPlaceEmail] = useState('')
  const [homePage, setHomePage] = useState('')

  useEffect(() => {

  },[])

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(process.env.APP_URL+'/api/register', {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      password_confirmation: passwordConfirmation,
      language: localStorage.getItem('i18nextLng')
    }).then(response => {
      localStorage.setItem('token',response.data.token)
      if(place === '1'){
        axios.post(process.env.APP_URL+'/api/places', {
          name: placeName,
          address: address,
          city: city,
          zip_code: zipCode,
          phone: phone,
          email: placeEmail,
          home_page: homePage
        },{
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          localStorage.setItem('place_id',response.data.id)
          window.location.href="/"
        }).catch(error => {})
      }else{
        window.location.href="/"
      }
    }).catch(error => {
      setFirstNameError([])
      setLastNameError([])
      setEmailError([])
      setPasswordError([])
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          if(key === 'first_name') setFirstNameError(value)
          if(key === 'last_name') setLastNameError(value)
          if(key === 'email') setEmailError(value)
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
      case 'phone':
        setPhone(e.target.value)
        break;
      case 'place_email':
        setPlaceEmail(e.target.value)
        break;
      case 'home_page':
        setHomePage(e.target.value)
        break;
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
                <label htmlFor="first_name" className="form-label">{t('First name')}</label>
                <input onChange={onChange} type="text"
                       className={`form-control ${firstNameError.length > 0 ? 'is-invalid' : ''}`}
                       name="first_name" id="first_name"/>
                {firstNameError.length > 0 &&
                  <>{firstNameError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                }
              </div>
              <div className="mb-3">
                <label htmlFor="last_name" className="form-label">{t('Last name')}</label>
                <input onChange={onChange} type="text"
                       className={`form-control ${lastNameError.length > 0 ? 'is-invalid' : ''}`}
                       name="last_name" id="last_name"/>
                {lastNameError.length > 0 &&
                  <>{lastNameError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                }
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">{t('Email address')}</label>
                <input onChange={onChange} type="email"
                       className={`form-control ${emailError.length > 0 ? 'is-invalid' : ''}`}
                       name="email" id="email"/>
                {emailError.length > 0 &&
                  <>{emailError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                }
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">{t('Password')}</label>
                <input onChange={onChange} type="password"
                       className={`form-control ${passwordError.length > 0 ? 'is-invalid' : ''}`}
                       name="password" id="password"/>
                {passwordError.length > 0 &&
                  <>{passwordError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                }
              </div>
              <div className="mb-3">
                <label htmlFor="password_confirmation" className="form-label">{t('Password confirmation')}</label>
                <input onChange={onChange} type="password"
                       className={`form-control`}
                       name="password_confirmation" id="password_confirmation"/>
              </div>
              <hr/>
              <div className="mb-3">
                <label htmlFor="password_confirmation" className="form-label">{t('Restaurant')}</label>
                <select onChange={onChange} id="place_id" name="place_id" className="form-select">
                  <option value="0">{t('Create later')}</option>
                  <option value="1">{t('Create new')}</option>
                </select>
              </div>
              {place === '1' &&
              <>
                <div className="mb-3">
                  <label htmlFor="place_name" className="form-label">{t('Name')}</label>
                  <input onChange={onChange} type="text" required
                         className={`form-control ${placeNameError.length > 0 ? 'is-invalid' : ''}`}
                         name="place_name" id="place_name"/>
                  {placeNameError.length > 0 &&
                  <>{placeNameError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                  }
                </div>
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">{t('Address')}</label>
                  <input onChange={onChange} type="text"
                         className={`form-control`}
                         name="address" id="address"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="city" className="form-label">{t('City')}</label>
                  <input onChange={onChange} type="text"
                         className={`form-control`}
                         name="city" id="city"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="zip_code" className="form-label">{t('Zip code')}</label>
                  <input onChange={onChange} type="text"
                         className={`form-control`}
                         name="zip_code" id="zip_code"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">{t('Phone')}</label>
                  <input onChange={onChange} type="text"
                         className={`form-control`}
                         name="phone" id="phone"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="place_email" className="form-label">{t('Email address')}</label>
                  <input onChange={onChange} type="email"
                         className={`form-control`}
                         name="place_email" id="place_email"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="home_page" className="form-label">{t('Home page')}</label>
                  <input onChange={onChange} type="text"
                         className={`form-control`}
                         name="home_page" id="home_page"/>
                </div>
              </>
              }
              <button type="submit" className="btn btn-primary">{t('Create profile')}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
