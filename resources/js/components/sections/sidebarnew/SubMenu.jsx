import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SubMenu.scss';


const SubMenu = ({ item }) => {
  const [subnav, setSubnav] = useState(false);

  const showSubnav = () => setSubnav(!subnav);

  return (
    <>
      <Link className='SidebarLink' to={item.path} >
        <div className='SidebarLinkItem'>
          {item.icon}
          <span className='SidebarLabel'>{item.title}</span>
        </div>
        <div className='SidebarButtonOpen' onClick={item.subNav && showSubnav}>
          {item.subNav && subnav
            ? item.iconOpened
            : item.subNav
            ? item.iconClosed
            : null}
        </div>
      </Link>
      {subnav &&
        item.subNav.map((item, index) => {
          return (
            <Link className='DropdownLink' to={item.path} key={index}>
              {item.icon}
              <span className='SidebarLabel'>{item.title}</span>
            </Link>
          );
        })}
    </>
  );
};

export default SubMenu;