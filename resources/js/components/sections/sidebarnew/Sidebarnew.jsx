import React, { useState } from 'react';
// import styled from 'styled-components';
import './sidebarnew.scss';

// import { Link } from 'react-router-dom';
import { FeaturedPlayListOutlined, SettingsOutlined} from '@mui/icons-material';
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';
// import Logo from './header/logo';
// import { IconContext } from 'react-icons/lib';



// const Nav = styled.div`
//   background: #343C48;
//   height: 54px;
//   display: flex;
//   justify-content: flex-start;
//   align-items: center;
// `;


// const NavIcon = styled(Link)`
//   margin-left: 2rem;
//   font-size: 18px;
//   height: 100%;
//   display: flex;
//   justify-content: flex-start;
//   align-items: center;
//   color: #fff;
// `;

const Sidebar = () => {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>  
        <div className='Sadebar' sidebar={sidebar}>
          <div className='SadebarWrap'>
            {SidebarData.map((item, index) => {
              return <SubMenu item={item} key={index} />;
            })}
          </div>
        </div>  
        
    </>
  );
};

export default Sidebar;