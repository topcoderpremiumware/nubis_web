import React, { useState } from 'react';
import {NavLink} from 'react-router-dom';
import './SubMenu.scss';
import { useTranslation } from 'react-i18next';


const SubMenu = ({ item }) => {
  const [subnav, setSubnav] = useState(false);

  const showSubnav = () => setSubnav(!subnav);
  const { t } = useTranslation();
  const ItemTagName = item.subNav ? 'div' : 'NavLink';
  return (
    <>
      <ItemTagName className='SidebarLink' to={item.path} onClick={item.subNav && showSubnav}>
        <div className='SidebarLinkItem'>
          {item.icon}
          <span className='SidebarLabel'>{t(item.title)}</span>
        </div>
        <div className='SidebarButtonOpen'>
          {item.subNav && subnav
            ? item.iconOpened
            : item.subNav
            ? item.iconClosed
            : null}
        </div>
      </ItemTagName>
      {subnav &&
        item.subNav.filter(item => {
          return item.hasOwnProperty('show') ? item.show : true
        }).map((item, index) => {
          return (
            <NavLink className='DropdownLink' to={item.path} key={index}>
              {item.icon}
              <span className='SidebarLabel'>{t(item.title)}</span>
            </NavLink>
          );
        })}
    </>
  );
};

export default SubMenu;
