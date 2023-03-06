import React, {useEffect, useState} from 'react';
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
import eventBus from "../../../eventBus";
import PlanCanvas from "./TablePlan/PlanCanvas";
import TimeLinePlan from "./TimeLinePlan/TimeLinePlan";
import { Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';


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
  const navigate = useNavigate();

  const [value, setValue] = useState(0);
  const [tableSidebar, setTableSidebar] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isFullWidth, setIsFullWidth] = useState(false)

  useEffect(() => {
    eventBus.on("openTableSidebar",(data) => {
      setTableSidebar(data.type)
    })
    eventBus.on("placeChanged",(data) => {
      setTableSidebar('')
    })
    eventBus.on("areaChanged",(data) => {
      setTableSidebar('')
    })
    eventBus.on("timeChanged",(data) => {
      setTableSidebar('')
    })
    eventBus.on("dateChanged",(data) => {
      setTableSidebar('')
    })
  },[])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className='pages__container DayView__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <Button
          variant="contained" 
          size="sm"
          type="button"
          onClick={() => navigate('/VideoGuides')}
        >{t('See Nubis Academy')}</Button>
      </Stack>
      <DayViewTop />
      <div style={{display:'flex',height:'100%',overflow:'hidden'}}>
        <Box sx={{ width: '100%', flex: 1, display: isFullWidth ? 'none' : 'flex',flexDirection:'column' }} >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className='DayView__Boxbuttons'>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" >
              <Tab label={t('Bookings')} {...a11yProps(0)} />
              <Tab label={t('Waiting List')} {...a11yProps(1)} />
              <Tab label={t('Deleted bookings')} {...a11yProps(2)} />
            </Tabs>
          </Box>
          <TabPanel className='DayView__BoxItem' value={value} index={0}>
            <DayViewTableBookings setSelectedOrder={setSelectedOrder} />
          </TabPanel>
          <TabPanel className='DayView__BoxItem' value={value} index={1}>
            <DayViewTableWaiting/>
          </TabPanel>
          <TabPanel className='DayView__BoxItem' value={value} index={2}>
            <DayViewTableDeleted/>
          </TabPanel>
        </Box>
        {tableSidebar === 'timePlan' && <div className="tablePlanSidebar">
          <TimeLinePlan/>
        </div>}
        {tableSidebar === 'tablePlan' && <div className="tablePlanSidebar">
          <PlanCanvas 
            setSelectedOrder={setSelectedOrder}
            isFullWidth={isFullWidth}
            setFullWidth={setIsFullWidth}
          />
        </div>}
      </div>
      <BottomPanel selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
    </div>
  );
}
