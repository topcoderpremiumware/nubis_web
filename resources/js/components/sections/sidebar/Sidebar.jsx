import React, {useEffect, useState} from 'react';
import './sidebar.scss';
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';

import SidebarSelect from './SidebarSelect';
import Navbar from '../navbar/Navbar';
import eventBus from "../../../eventBus";
import {BsChevronCompactLeft, BsChevronCompactRight, BsFullscreen, BsFullscreenExit} from "react-icons/bs";


const Sidebar = (props) => {
  const [sidebarData, setSidebarData] = useState(false)

  useEffect(() => {
    eventBus.on('roleChanged', () => {
      console.log('SidebarData',SidebarData(window))
      setSidebarData(SidebarData(window))
    })
  }, [])

  return (
    <div className='Sadebar'>
      <div className='SadebarWrap'>
        <SidebarSelect />
        {sidebarData && sidebarData.filter(item => {
          return item.hasOwnProperty('show') ? item.show : true
        }).map((item, index) => {
          return <SubMenu item={item} key={index} />;
        })}

        <div className="sidebar-nav">
          <Navbar />
        </div>
      </div>
      <div
        className="wrapButton"
        onClick={() => eventBus.dispatch('toggleSidebar')}>
        {props.sidebarIsVisible ? <BsChevronCompactLeft /> : <BsChevronCompactRight />}
      </div>
    </div>
  );
};

export default Sidebar;
