import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function SidebarSelect() {
  const [age, setAge] = React.useState('');

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <div className='SidebarSelect__container'>
      <FormControl sx={{ minWidth: 120 }} className='SidebarSelect'>
        <Select
          value={age}
          onChange={handleChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem value="">
            <em>---</em>
          </MenuItem>
          <MenuItem value={10}>Restaurant 1</MenuItem>
          <MenuItem value={20}>Restaurant 2</MenuItem>
          <MenuItem value={30}>Restaurant 3</MenuItem>
        </Select>
        {/* <FormHelperText>Without label</FormHelperText> */}
      </FormControl>
    </div>
  );
}
