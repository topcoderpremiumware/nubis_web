import React, {useState} from 'react';
import './DayView.scss';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import DayViewTop from "./toppanel/DayViewTop";
import BottomPanel from "./bottompanel/BottomPanel";
import {useTranslation} from "react-i18next";
import DayViewTableBookings from './tables/DayViewTableBookings';
import DayViewTableWaiting from "./tables/DayViewTableWaiting";
import DayViewTableDeleted from "./tables/DayViewTableDeleted";


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div style={{height:'100%'}}>{children}</div>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function DayViewContent() {
  const {t} = useTranslation();

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className='pages__container DayView__container'>
      <DayViewTop />
      <div style={{display:'flex',height:'100%'}}>
        <Box sx={{ width: '100%',flex:1,display:'flex',flexDirection:'column' }} >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className='DayView__Boxbuttons'>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" >
              <Tab label={t('Bookings')} {...a11yProps(0)} />
              <Tab label={t('Waiting List')} {...a11yProps(1)} />
              <Tab label={t('Deleted bookings')} {...a11yProps(2)} />
            </Tabs>
          </Box>
          <TabPanel className='DayView__BoxItem' value={value} index={0}>
            <DayViewTableBookings/>
          </TabPanel>
          <TabPanel className='DayView__BoxItem' value={value} index={1}>
            <DayViewTableWaiting/>
          </TabPanel>
          <TabPanel className='DayView__BoxItem' value={value} index={2}>
            <DayViewTableDeleted/>
          </TabPanel>
        </Box>
        {false && <div style={{flex:1}}>Test</div>}
      </div>
      <BottomPanel/>
    </div>
  );
}
