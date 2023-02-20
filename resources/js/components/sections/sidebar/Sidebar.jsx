import React from 'react';
import './sidebar.scss';
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';

import SidebarSelect from './SidebarSelect';
import Navbar from '../navbar/Navbar';

const Sidebar = () => {
  return (
    <div className='Sadebar'>
      <div className='SadebarWrap'>
        <SidebarSelect />
        {SidebarData.map((item, index) => {
          return <SubMenu item={item} key={index} />;
        })}

        <div className="sidebar-nav">
          <Navbar />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;