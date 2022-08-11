import React from 'react';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import './TimePlan.scss';

export default function TimePlan() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'timePlan' : undefined;

  return (
    <div className='TimePlan-logo'>
        <img src='./images/timeplan-icon.svg' aria-describedby={id}  onClick={handleClick}></img>
      {/* <button aria-describedby={id} type="button" onClick={handleClick}>
        Toggle Popper
      </button> */}
      <Popper id={id} open={open} anchorEl={anchorEl}>
        <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
          <div className='TimePlanPopper__container'>
            Time
          </div>
        </Box>
      </Popper>
    </div>
  );
}
