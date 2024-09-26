import * as React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {useEffect} from "react";
import eventBus from "../../../../eventBus";
import {simpleCatchError} from "../../../../helper";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField
} from "@mui/material";
import {useTranslation} from "react-i18next";

export default function FindBookingPopUp({setSelectedOrder}) {
  const {t} = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [orderId, setOrderId] = React.useState('');
  const handleClose = () => {
    setOpen(false);
  }

  useEffect(async () => {
    eventBus.on("findBookingOpen",  (data) => {
      setOpen(true);
    });
  }, [])

  const getOrder = () => {
    if(orderId){
      axios.get(`${process.env.MIX_API_URL}/api/orders/${orderId}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        setSelectedOrder(response.data)
        eventBus.dispatch('openNewBookingPopUp')
        setOpen(false)
      }).catch(error => {
        simpleCatchError(error)
      })
    }
  }

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm"
            scroll="paper"
            PaperProps={{
              style: {
                backgroundColor: "#F2F3F9",
              },
            }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <>{t('Find Booking')}</>
        <IconButton onClick={handleClose} sx={{
          position:'absolute',
          right:8,
          top:8,
          color:(theme) => theme.palette.grey[500],
        }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={7}>
            <TextField label={t('Booking id')} size="small" fullWidth
                       type="text" id="id" name="id" required
                       onChange={(e) => setOrderId(e.target.value)} value={orderId}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Button variant="contained" onClick={getOrder}>{t('Find')}</Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
