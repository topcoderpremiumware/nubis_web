import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton, InputLabel, MenuItem, Select
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";

export default function PaymentMethodPopup(props){
  const {t} = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {

  },[props.open])

  return (
    <Dialog onClose={props.onClose} open={props.open} fullWidth maxWidth="sm"
            scroll="paper"
            PaperProps={{
              style: {
                backgroundColor: "#F2F3F9",
                margin: 0,
                width: '100%'
              },
            }}
    >
      <DialogTitle sx={{m: 0, p: 2}}>
        <>{t('Payment method')}</>
        <IconButton onClick={props.onClose} sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <FormControl size="small" fullWidth sx={{mb: 2}}>
          <InputLabel id="label_payment_method">{t('Payment method')}</InputLabel>
          <Select label={t('Payment method')} value={paymentMethod}
                  labelId="label_payment_method" id="payment_method" name="payment_method"
                  onChange={(e) => setPaymentMethod(e.target.value)}>
            {[{value:'card',label:t('Card')},{value:'cash',label:t('Cash')}].map((el,key) => {
              return <MenuItem key={key} value={el.value}>{el.label}</MenuItem>
            })}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="contained" onClick={() => props.onChange(paymentMethod)}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
}
