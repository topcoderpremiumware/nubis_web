import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function BasicMainInformation() {
  return (
    <Box
      component="form"
      sx={{
        '& > :not(style)': { m: 1, width: '100' },
      }}
      noValidate
      autoComplete="off"
    >
      
        
      <div className="BasicInformation__TextForm__Container">
        <div className='MainInformation'>
        <h2>Main information</h2>
          <div className='BasicInformation__TextField'>
          <TextField  id="outlined-basic" label="Name" variant="outlined" />
          </div>
          <div className='BasicInformation__TextField'>
            <TextField  id="outlined-basic" label="Address" variant="outlined" />
          </div>
          <div className='BasicInformation__TextField'>
            <TextField id="outlined-basic" label="Zip Code" variant="outlined" />
          </div>
          <div className='BasicInformation__TextField'>
            <TextField  id="outlined-basic" label="City" variant="outlined" />
          </div>
          <div className='BasicInformation__TextField'>
            <TextField  id="outlined-basic" label="Phone" variant="outlined" />
          </div>
          <div className='BasicInformation__TextField'>
            <TextField  id="outlined-basic" label="Email" variant="outlined" />
          </div>   
        </div>
        <div className='SecondaryInformation'>
          <h2>Secondary information</h2>
          <div className='BasicInformation__TextField'>
            <TextField  id="outlined-basic" label="Homepage" variant="outlined" />
          </div>
          <div className='BasicInformation__TextField'>
            <TextField  id="outlined-basic" label="Menu Link" variant="outlined" />
          </div>
          <div className='BasicInformation__TextField'>
            <TextField  id="outlined-basic" label="SMS Sender Name" variant="outlined" />
          </div>
        </div>
      </div>
      <Stack spacing={2} direction="row">
        <Button variant="contained">Save changes</Button>
        <Button variant="text">Cancel</Button>
      </Stack>
    </Box>
  );
}
