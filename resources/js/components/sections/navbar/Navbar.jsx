import axios from 'axios';
import React from 'react'
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'
import Flag from 'react-world-flags'
import eventBus from "../../../eventBus";

const Navbar = () => {
  const { t, i18n } = useTranslation();

  const logout = (e) => {
    e.preventDefault()
    axios.post(process.env.MIX_API_URL + '/api/logout', {}, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
    }).catch(e => {
      console.log('logout error: ', e)
    })
    let lang = localStorage.getItem('i18nextLng')
    let qz_cert = localStorage.getItem('qz_cert')
    let qz_key = localStorage.getItem('qz_key')
    localStorage.clear()
    localStorage.setItem('i18nextLng', lang)
    localStorage.setItem('qz_cert', qz_cert)
    localStorage.setItem('qz_key', qz_key)
    window.location.href = "/"
  }

  const changeLang = (lang) => {
    i18n.changeLanguage(lang).then(() => {
      eventBus.dispatch('langChanged')
    })
  }

  return (
    <ul className="navbar-nav w-100">
      <li className="nav-item ms-lg-auto">
        {localStorage.getItem('token') ?
          <Link className='nav-link' to="/VideoGuides">{t('Table Booking POS Academy')}</Link>
          : null
        }
      </li>
      <li className="nav-item dropdown">
        <a className="nav-link dropdown-toggle" type="button" id="languageDropdown"
          data-bs-toggle="dropdown" aria-expanded="false">
          <Flag height="13" code={window.langs.filter(l => {
            return l.lang === localStorage.getItem('i18nextLng')
          })[0].country
          } />
          <span>{t('Language')}</span>
        </a>
        <ul className="dropdown-menu" aria-labelledby="languageDropdown">
          {window.langs.map((lang, key) => {
            return <li className="language-item" key={key}
              onClick={(e) => { changeLang(lang.lang) }}>
              <span><Flag height="13" code={lang.country} /> {lang.title}</span>
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
    </ul>
  )
}

export default Navbar
