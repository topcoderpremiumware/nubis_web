import React from 'react'

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function SelectDuration() {
    const [point, setPoint] = React.useState('');

    const handleChange = (event) => {
      setPoint(event.target.value);
    };
  return (
    <div>
         <FormControl sx={{ minWidth: 120 }} className=''>
          <Select
            value={point}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="" className='ItemSelect'>
              <em>Select area</em>
            </MenuItem>
            <MenuItem value={10} className='ItemSelect'>A La Carte</MenuItem>
            <MenuItem value={20} className='ItemSelect'>Take away</MenuItem>
            <MenuItem value={30} className='ItemSelect'>teras</MenuItem>
          </Select>
        </FormControl>
    </div>
  )
}
