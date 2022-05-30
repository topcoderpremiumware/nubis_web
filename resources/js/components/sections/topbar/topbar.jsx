import React from 'react'
import './topbar.scss'
import { Link } from 'react-router-dom';
import { NotificationsNone, Language } from '@material-ui/icons';
import Flag from 'react-world-flags'
import { useTranslation } from 'react-i18next';

export default function Topbar() {
    const { t, i18n } = useTranslation();
    const langs = [
        {country: 'GB', lang: 'en', title: 'English'},
        {country: 'DK', lang: 'nl', title: 'Dansk'},
    ];

  return (
    <div className='topbar'>
        <div className="topbarWrapper container">
            <div className="topbar__left">
              <div className='topbar__logo topbar__item'>
                <Link to="/" className='logolink link'>
                  <span className='logo'>DinnerBooking</span>
                </Link>

              </div>
              <div className='topbar__country topbar__item'>
                <div className='topba__countryWrapper'>
                <span className='topbar__item-text'>Country</span>
                </div>
              </div>

            </div>
            <div className='topbar__right'>
              <div className='topbar__myRestaurants topbar__item'>
                <span className='topbar__item-text'>My Restaurants</span>
              </div>
              <div className='topbar__Support topbar__item'>
                <span className='topbar__item-text'>Support</span>
              </div>
              <div className='topbar__Language topbar__item'>
                {/*<Language />*/}
                {/*<span className='topbar__item-text'>Language</span>*/}
                  <div className="dropdown">
                      <button className="btn topbar__item dropdown-toggle" type="button" id="languageDropdown"
                              data-bs-toggle="dropdown" aria-expanded="false">
                          <Flag height="13" code={ langs.filter(l => {
                              return l.lang === localStorage.getItem('i18nextLng')})[0].country
                          } />
                          {t('Language')}
                      </button>
                      <ul className="dropdown-menu" aria-labelledby="languageDropdown">
                          {langs.map((lang, key )=> {
                              return <li className="language-item" key={key}
                                         onClick={(e) => {i18n.changeLanguage(lang.lang)}}>
                                  <span><Flag height="13" code={ lang.country } /> {lang.title}</span>
                              </li>
                          })}
                      </ul>
                  </div>
              </div>
              <div className='topbarIconContainer topbar__item'>
                <NotificationsNone/>
                <span className='topbarIconBag'>2+</span>
              </div>

            </div>
        </div>
    </div>
  )
}
