import React from 'react'
import './topbar.scss'
import { Link } from 'react-router-dom';
import Alert from "../../Notification/Alert";
import eventBus from '../../../eventBus';
import Navbar from '../navbar/Navbar';

export default function Topbar() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
        <div className="container">
          <Link className="navbar-brand" to="/"><img src='/images/logo.png' width="90"/></Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={() => eventBus.dispatch('toggleSidebar')}
          >
            <span className="navbar-toggler-icon"/>
          </button>
          <div className="collapse navbar-collapse navbar-responsive" id="navbarNav">
            <Navbar />
          </div>
        </div>
      </nav>
      <Alert/>
    </>
  )
}
