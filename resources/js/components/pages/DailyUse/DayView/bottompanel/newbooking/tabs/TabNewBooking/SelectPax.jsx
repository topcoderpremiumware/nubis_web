import React from 'react'

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function SelectPax() {
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
              <em>Select pax</em>
            </MenuItem>
            <MenuItem value={10} className='ItemSelect'>1</MenuItem>
            <MenuItem value={20} className='ItemSelect'>2</MenuItem>
            <MenuItem value={30} className='ItemSelect'>3</MenuItem>
            <MenuItem value={40} className='ItemSelect'>4</MenuItem>
            <MenuItem value={50} className='ItemSelect'>5</MenuItem>
          </Select>
        </FormControl>
    </div>
  )
}
