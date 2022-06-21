import React from 'react'
import './topbar.scss'
import { Link } from 'react-router-dom';
import { NotificationsNone, Language } from '@material-ui/icons';
import Flag from 'react-world-flags'
import { useTranslation } from 'react-i18next';
import Alert from "../../Notification/Alert";

export default function Topbar() {
  const { t, i18n } = useTranslation();

  const logout = (e) => {
    e.preventDefault()
    axios.post(process.env.APP_URL+'/api/logout', {},{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      localStorage.removeItem('token')
      localStorage.removeItem('place_id')
      window.location.href="/"
    }).catch(e => {
      console.log('logout error: ',e)
    })
  }
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
        <div className="container">
          <Link className="navbar-brand" to="/">OnlineDinnerBooker</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                  aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"/>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav w-100">
              <li className="nav-item">
                <a className="nav-link" aria-current="page" href="#">Country</a>
              </li>
              <li className="nav-item ms-0 ms-lg-auto">
                <a className="nav-link" href="#">My Restaurants</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Support</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" type="button" id="languageDropdown"
                        data-bs-toggle="dropdown" aria-expanded="false">
                  <Flag height="13" code={ window.langs.filter(l => {
                    return l.lang === localStorage.getItem('i18nextLng')})[0].country
                  } />
                  <span>{t('Language')}</span>
                </a>
                <ul className="dropdown-menu" aria-labelledby="languageDropdown">
                  {window.langs.map((lang, key )=> {
                    return <li className="language-item" key={key}
                               onClick={(e) => {i18n.changeLanguage(lang.lang)}}>
                      <span><Flag height="13" code={ lang.country } /> {lang.title}</span>
                    </li>
                  })}
                </ul>
              </li>
              <li className="nav-item">
                {localStorage.getItem('token') ?
                  <a className='nav-link' href="#" onClick={logout}>{t('Sign out')}</a>
                  :
                  <Link className='nav-link' to="/login">{t('Sign in')}</Link>
                }
              </li>
              <li className="nav-item">
                <span className="topbarIconContainer">
                  <NotificationsNone/>
                  <span className='topbarIconBag'>2+</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <Alert/>
    </>
  )
}
