import React, { useState } from 'react';
import './sidebar.scss';
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';

import SidebarSelect from './SidebarSelect';


const Sidebar = () => {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>  
        <div className='Sadebar' sidebar={sidebar}>
          <div className='SadebarWrap'>
            <SidebarSelect />
            {SidebarData.map((item, index) => {
              return <SubMenu item={item} key={index} />;
            })}
          </div>
        </div>  
        
    </>
  );
};

export default Sidebar;