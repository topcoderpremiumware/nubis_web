import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function ButtonCancel() {
  return (
    <div className='NewBooking__Bottom-button'>
        <Stack spacing={2} direction="row" >
            <Button variant="outlined" >Cancel</Button>
        </Stack>
    </div>
    
  );
}
