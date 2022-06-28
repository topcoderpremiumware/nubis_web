import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function SelectEmail() {

   return (
    <Box
      sx={{
        width: 500,
        maxWidth: '100%',
      }}
    >
      <TextField fullWidth  id="fullWidth" className='ItemSelect' type='email' />
    </Box>
  );
}
