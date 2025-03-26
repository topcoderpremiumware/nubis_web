import './Pos.scss'
import { useTranslation} from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
   Grid,
  TextField
} from "@mui/material";
import React, {useEffect, useState} from "react";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/material.css'
import axios from "axios";
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import QrCodeIcon from '@mui/icons-material/QrCode';
import QRCode from "react-qr-code";

export default function SendReceiptPopup(props){
  const {t} = useTranslation();
  const [data, setData] = useState({})
  const [smsLimit, setSmsLimit] = useState(0)

  useEffect(() => {
    setData({type: 'email'})
    getSmsLimit()
  },[props.open])

  const handleClose = () => {
    props.onClose()
  }

  const onChange = (e) => {
    setData(prev => ({...prev, [e.target.name]: e.target.value}))
  }

  const getSmsLimit = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/message_limit`)
      .then(response => {
        setSmsLimit(response.data.count)
      })
  }

  return (
    <Dialog onClose={handleClose} open={props.open} fullWidth maxWidth="sm"
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
        <>{t('Send Receipt')}</>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{mb: 3}}>
          <Grid item xs={12} sm={4}>
            <div className={`paymentButton ${data.type === 'email' ? 'active' : ''}`}
                 onClick={() => onChange({target: {name: 'type', value: 'email'}})}>
              <div className="label">{t('Email')}</div>
              <EmailIcon/>
            </div>
          </Grid>
          {smsLimit > 0 && <Grid item xs={12} sm={4}>
            <div className={`paymentButton ${data.type === 'sms' ? 'active' : ''}`}
                 onClick={() => onChange({target: {name: 'type', value: 'sms'}})}>
              <div className="label">{t('SMS')}</div>
              <SmsIcon/>
            </div>
          </Grid>}
          <Grid item xs={12} sm={4}>
            <div className={`paymentButton ${data.type === 'qr' ? 'active' : ''}`}
                 onClick={() => onChange({target: {name: 'type', value: 'qr'}})}>
              <div className="label">{t('QR code')}</div>
              <QrCodeIcon/>
            </div>
          </Grid>
        </Grid>

        {data.type === 'email' && <TextField label={t('Customer email')} size="small" fullWidth sx={{mb: 2}}
           type="email" id="email" name="email" required
           onChange={onChange}
           value={data.email}
        />}
        {data.type === 'sms' && <PhoneInput
          country={'dk'}
          value={data.phone}
          onChange={phone => {
            onChange({target: {name: 'phone', value: '+' + phone}})
          }}
          containerClass="phone-input mb-3"
        />}
        {data.type === 'qr' ? <>
          <div className="qr_code_wrapper">
            <QRCode value={`${process.env.MIX_APP_URL}/receipts/${btoa(props.check.id)}`} />
            <p>{t('Scan this QR code to get a digital receipt')}</p>
          </div>
        </> : null}
      </DialogContent>
      <DialogActions sx={{p:2}}>
        {data.type === 'qr' ? <Button variant="contained" onClick={handleClose}>{t('Done')}</Button> : <>
          <Button variant="outlined" onClick={handleClose}>{t('Skip')}</Button>
          <Button variant="contained" onClick={() => props.onChange(data)}>{t('Send')}</Button>
        </>}
      </DialogActions>
    </Dialog>
  );
}
