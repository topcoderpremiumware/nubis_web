import React from 'react'
import './topbar.scss'
import { Link } from 'react-router-dom';
import { NotificationsNone, Language } from '@material-ui/icons';

export default function Topbar() {
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
                <Language />
                <span className='topbar__item-text'>Language</span>
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
