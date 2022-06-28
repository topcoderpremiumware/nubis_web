import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function SelectPhone() {
  return (
    <div className='TabNewBooking__PhoneNumber__container'>
      <Box
        sx={{
          width: 100,
          maxWidth: '100%',
        }}
      >
        <TextField fullWidth  id="fullWidth" className='ItemSelect'/>
    </Box>
  </div>

    // <Box
    //   component="form"
    //   sx={{
    //     '& > :not(style)': { m: 1, width: '90%' },
    //   }}
    //   noValidate
    //   autoComplete="off"
    // >
    //   <TextField id="outlined-basic"  variant="outlined"/>
    // </Box>
  );
}
