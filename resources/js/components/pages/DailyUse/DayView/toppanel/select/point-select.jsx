import React from 'react'

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


export default function PointSelect() {

  const [point, setPoint] = React.useState('');

  const handleChange = (event) => {
    setPoint(event.target.value);
  };

  return (
    <div className='DayViewSelect__container'>
      <FormControl sx={{ minWidth: 120 }} className='DayViewSelect'>
        <Select
          value={point}
          onChange={handleChange}
          displayEmpty
        >
          <MenuItem value="" className='ItemSelect'>
            <em>A La Carte</em>
          </MenuItem>
          <MenuItem value={10} className='ItemSelect'>teras</MenuItem>
          <MenuItem value={20} className='ItemSelect'>All areas</MenuItem>
        </Select>
      </FormControl>
    </div>
  )
}
