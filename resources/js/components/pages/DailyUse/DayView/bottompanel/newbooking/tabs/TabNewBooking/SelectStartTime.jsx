import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function DisabledOptions() {
  return (
    <div className='NewBooking__InputItem'>
      <Autocomplete
        id="disabled-options-demo"
        options={timeSlots}
        // getOptionDisabled={(option) =>
        //   option === timeSlots[0] || option === timeSlots[2]
        // }
        sx={{ width: 70 }}
        renderInput={(params) => <TextField {...params} />}
      />
    </div>
  );
}

// One time slot every 30 minutes.
const timeSlots = Array.from(new Array(24 * 2)).map(
  (_, index) =>
    `${index < 20 ? '0' : ''}${Math.floor(index / 2)}:${
      index % 2 === 0 ? '00' : '30'
    }`,
    
);
