import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function CkeckBoxEmail() {
  return (
    <FormGroup>
      <FormControlLabel control={<Checkbox />} label="Sign up for Email newsletter" />
      {/* <FormControlLabel disabled control={<Checkbox />} label="Disabled" /> */}
    </FormGroup>
  );
}

// defaultChecked