
import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function CkeckBoxSms() {
  return (
    <FormGroup>
      <FormControlLabel control={<Checkbox/>} label="Sign up for SMS service" />
      {/* <FormControlLabel disabled control={<Checkbox />} label="Disabled" /> */}
    </FormGroup>
  );
}

// defaultChecked