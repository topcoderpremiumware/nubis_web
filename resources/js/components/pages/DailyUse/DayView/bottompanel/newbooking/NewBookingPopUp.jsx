import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import NewBookingContent from './NewBookingPopUpContent';
import './NewBooking.scss';



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  height: '87%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function NewBookingPopUp() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button className='ButtonNewBooking' onClick={handleOpen}>NewBooking</Button>
      <Modal
        open={open}
        // onClose={handleClose}  
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className='NewBookingPopUp__container'>
          <div className='close-icon' onClick={handleClose}>x</div>
          <NewBookingContent/>
          {/* <Typography id="modal-modal-title" variant="h6" component="h2" onClick={handleClose}>
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>  */}
        </Box>
      </Modal>
    </div>
  );
}
