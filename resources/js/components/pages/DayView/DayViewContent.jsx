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
import { Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Pos from "./Pos/Pos";


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
  const [orders, setOrders] = useState([])
  const [posOpen, setPosOpen] = useState(false)

  useEffect(() => {
    eventBus.on("openTableSidebar",(data) => {
      if(!data.type) setIsFullWidth(false)
      if(window.innerWidth <= 1024 && data.type) setIsFullWidth(true)
      setTableSidebar(data.type)
    })
    eventBus.on("placeChanged",(data) => {
      setIsFullWidth(false)
      setTableSidebar('')
    })
    eventBus.on("loadedOrders",(data) => {
      setOrders(data)
    })
    eventBus.on("changedSelectedOrder",(order) => {
      setSelectedOrder(order)
    })
    function handleOpenPosPopUp (){
      setPosOpen(true)
    }
    eventBus.on("openPosPopUp",  handleOpenPosPopUp)
    return () => {
      eventBus.remove("openPosPopUp",  handleOpenPosPopUp)
    }
  },[])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const statistic = () => {
    return <Stack spacing={2} direction="row" alignItems="center">
      <span>{t('Total booking')}: {orders.length}</span>
      <span>{t('Total pax')}: {orders.reduce((prev, curr) => prev + curr.seats, 0)}</span>
    </Stack>
  }

  return (
    <div className='pages__container DayView__container'>
      <DayViewTop />
      <div style={{display:'flex',height:(window.innerWidth > 1024 ? '100%' : '100vh'),overflow:'hidden'}}>
        <Box sx={{ width: '100%', flex: 1, display: isFullWidth ? 'none' : 'flex',flexDirection:'column' }} >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className='DayView__Boxbuttons'>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" >
              <Tab label={t('Bookings')} {...a11yProps(0)} />
              <Tab label={t('Waiting List')} {...a11yProps(1)} />
              <Tab label={t('Deleted bookings')} {...a11yProps(2)} />
              {statistic()}
            </Tabs>
          </Box>
          <TabPanel className='DayView__BoxItem' value={value} index={0}>
            <DayViewTableBookings setSelectedOrder={setSelectedOrder} />
          </TabPanel>
          <TabPanel className='DayView__BoxItem' value={value} index={1}>
            <DayViewTableWaiting setSelectedOrder={setSelectedOrder} />
          </TabPanel>
          <TabPanel className='DayView__BoxItem' value={value} index={2}>
            <DayViewTableDeleted/>
          </TabPanel>
        </Box>
        {tableSidebar === 'timePlan' && <div className="tablePlanSidebar">
          <TimeLinePlan
            isFullWidth={isFullWidth}
            setFullWidth={setIsFullWidth}
          />
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
      {selectedOrder &&
        <Pos orderId={selectedOrder.id} open={posOpen} onClose={() => setPosOpen(false)}/>
      }
    </div>
  );
}
