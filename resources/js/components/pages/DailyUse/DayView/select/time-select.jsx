import React from 'react'

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


export default function TimeSelect() {

  const [time, setTime] = React.useState('');

  const handleChange = (event) => {
    setTime(event.target.value);
  };

  return (
    <div className='DayViewSelect__container'>
      <FormControl sx={{ minWidth: 120 }} className='DayViewSelect'>
        <Select
          value={time}
          onChange={handleChange}
          displayEmpty
        >
          <MenuItem value="" className='ItemSelect'>
            <em>All day</em>
          </MenuItem>
          <MenuItem value={20} className='ItemSelect'>17:00 - 21:00</MenuItem>
        </Select>
      </FormControl>
    </div>
  )
}
