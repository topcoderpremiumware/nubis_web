import React from 'react';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import './TablePlan.scss';

export default function TablePlan() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'tablePlan' : undefined;

  return (
    <div className='TablePlan-logo'>
        <img src='./images/tableplan-icon.svg' aria-describedby={id}  onClick={handleClick}></img>
      {/* <button aria-describedby={id} type="button" onClick={handleClick}>
        Toggle Popper
      </button> */}
      <Popper id={id} open={open} anchorEl={anchorEl}>
        <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
          <div className='TablePlanPopper__container'>
            Table
          </div>
        </Box>
      </Popper>
    </div>
  );
}
