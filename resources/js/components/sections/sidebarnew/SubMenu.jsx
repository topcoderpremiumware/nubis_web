import React, { useState } from 'react';
import {Link, NavLink} from 'react-router-dom';
import './SubMenu.scss';
import { useTranslation } from 'react-i18next';


const SubMenu = ({ item }) => {
  const [subnav, setSubnav] = useState(false);

  const showSubnav = () => setSubnav(!subnav);
    const { t } = useTranslation();
  return (
    <>
      <NavLink className='SidebarLink' to={item.path} >
        <div className='SidebarLinkItem'>
          {item.icon}
          <span className='SidebarLabel'>{t(item.title)}</span>
        </div>
        <div className='SidebarButtonOpen' onClick={item.subNav && showSubnav}>
          {item.subNav && subnav
            ? item.iconOpened
            : item.subNav
            ? item.iconClosed
            : null}
        </div>
      </NavLink>
      {subnav &&
        item.subNav.map((item, index) => {
          return (
            <NavLink className='DropdownLink' to={item.path} key={index}>
              {item.icon}
              <span className='SidebarLabel'>{item.title}</span>
            </NavLink>
          );
        })}
    </>
  );
};

export default SubMenu;
