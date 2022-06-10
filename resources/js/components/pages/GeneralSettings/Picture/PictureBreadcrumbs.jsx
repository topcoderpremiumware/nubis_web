import * as React from 'react';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

export default function PictureBreadcrumbs() {
  return (
    <div role="presentation" onClick={handleClick}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          General Settings
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="#"
        >
          Selected restaurant
        </Link>
        <Typography color="text.primary">Picture</Typography>
      </Breadcrumbs>
    </div>
  );
}
