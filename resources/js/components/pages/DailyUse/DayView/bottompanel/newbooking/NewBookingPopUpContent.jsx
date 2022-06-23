import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import './NewBooking.scss';


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
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
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


export default function NewBookingPopUpContent() {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // const [open, setOpen] = React.useState(false);
  // const handleClose = () => setOpen(false);
  return (
          <div className='NewBookingPopUpContent'>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', scroll: true, }} className='NewBooking__Boxbuttons'>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                  <Tab label="New Booking" {...a11yProps(0)} />
                  <Tab label="Contact person" {...a11yProps(1)} />
                  <Tab label="File" {...a11yProps(2)} />
                  <Tab label="Whaiting List" {...a11yProps(3)} />
                  <Tab label="Deleted" {...a11yProps(4)} />
                </Tabs>
              </Box>
              <TabPanel className='NewBooking__BoxItem' value={value} index={0}>
                1
              </TabPanel>
              <TabPanel value={value} index={1}>
                2
              </TabPanel>
              <TabPanel value={value} index={2}>
                3
              </TabPanel>
              <TabPanel value={value} index={3}>
                4
              </TabPanel>
              <TabPanel value={value} index={4}>
                5
              </TabPanel>
            </Box>
          </div>
  );
}
