import React, {useEffect, useState} from "react";
import  './CustomBookingLength.scss';
import { useTranslation } from 'react-i18next';
import 'moment/locale/da'
import {
  FormControl,
  FormControlLabel, FormGroup,
  Grid, InputLabel,
  MenuItem, Select, Switch, TextField,
} from "@mui/material";
import 'react-datepicker/dist/react-datepicker.css';
import ListSubheader from "@mui/material/ListSubheader";
import './../GuestPayment/PaymentSettings/PaymentSettings.scss'
export default function PaymentSettings(props) {
  const { t } = useTranslation();

  const cancelTimes = [
    {title: `30 ${t('minutes')}`, value: 30},
    {title: `45 ${t('minutes')}`, value: 45},
    {title: `1 ${t('hour')}`, value: 60},
    {title: `1.5 ${t('hours')}`, value: 60*1.5},
    {title: `2 ${t('hours')}`, value: 60*2},
    {title: `2.5 ${t('hours')}`, value: 60*2.5},
    {title: `3 ${t('hours')}`, value: 60*3},
    {title: `4 ${t('hours')}`, value: 60*4},
    {title: `5 ${t('hours')}`, value: 60*5},
    {title: `6 ${t('hours')}`, value: 60*6},
    {title: `8 ${t('hours')}`, value: 60*8},
    {title: `12 ${t('hours')}`, value: 60*12},
    {title: `24 ${t('hours')}`, value: 60*24},
    {title: `36 ${t('hours')}`, value: 60*36},
    {title: `48 ${t('hours')}`, value: 60*48},
    {title: `3 ${t('days')}`, value: 60*24*3},
    {title: `4 ${t('days')}`, value: 60*24*4},
    {title: `5 ${t('days')}`, value: 60*24*5},
    {title: `6 ${t('days')}`, value: 60*24*6},
    {title: `7 ${t('days')}`, value: 60*24*7},
    {title: `14 ${t('days')}`, value: 60*24*14},
    {title: `21 ${t('days')}`, value: 60*24*21},
    {title: t('Not allowed'), value: 60*24*1000},
  ]

  return (<>
    <ListSubheader component="div" disableSticky sx={{mb:2}}>{t('Payment settings')}</ListSubheader>
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            name="payment_settings_enabled"
            checked={parseInt(props.lengths.payment_settings?.enabled) === 1}
            onChange={props.onChange}
          />
        }
        label={t('Enable payment settings')}
      />
    </FormGroup>
    <b>{t('Method')}</b>
    <Grid container spacing={1} sx={{pb: 2}}>
      <Grid item xs={12} sm={4}>
        <div
          className={`payment-card ${props.lengths.payment_settings?.method === "deduct" && " payment-card-selected"} ${!parseInt(props.lengths.payment_settings?.enabled) && " payment-card-disabled"}`}
          onClick={() => parseInt(props.lengths.payment_settings?.enabled) && props.onChange({target:{name:'payment_settings_method',value:'deduct'}})}
        >
          <h4>{t('Deduct')}</h4>
          <p>{t('The amount is withdrawn immediately')}</p>
        </div>
      </Grid>
      <Grid item xs={12} sm={4}>
        <div
          className={`payment-card ${props.lengths.payment_settings?.method === "reserve" && " payment-card-selected"} ${!parseInt(props.lengths.payment_settings?.enabled) && " payment-card-disabled"}`}
          onClick={() => parseInt(props.lengths.payment_settings?.enabled) && props.onChange({target:{name:'payment_settings_method',value:'reserve'}})}
        >
          <h4>{t('Reserve')}</h4>
          <p>{t('The amount is reserved and waithdrawn 6 hours before arrival or in case of late cancellation')}</p>
        </div>
      </Grid>
      <Grid item xs={12} sm={4}>
        <div
          className={`payment-card ${props.lengths.payment_settings?.method === "no_show" && " payment-card-selected"} ${!parseInt(props.lengths.payment_settings?.enabled) && " payment-card-disabled"}`}
          onClick={() => parseInt(props.lengths.payment_settings?.enabled) && props.onChange({target:{name:'payment_settings_method',value:'no_show'}})}
        >
          <h4>{t('No-show')}</h4>
          <p>{t('Stores credit card information and charges a no-show or late cancellation fee')}</p>
        </div>
      </Grid>
    </Grid>
    <Grid container spacing={2} sx={{pb: 2}}>
      <Grid item xs={12} sm={6}>
        <TextField label={t('Payment Price')} size="small" fullWidth
         name="payment_settings_amount"
         type="number" value={props.lengths.payment_settings?.amount}
         onWheel={(e) => e.target.blur()}
         onChange={props.onChange}
         disabled={!parseInt(props.lengths.payment_settings?.enabled)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl size="small" fullWidth>
          <InputLabel id="label_languages">{t('Cancellation deadline')}</InputLabel>
          <Select label={t('Cancellation deadline')} value={props.lengths.payment_settings?.cancel_deadline}
                  size="small"
                  name="payment_settings_cancel_deadline"
                  onChange={props.onChange}
                  disabled={!parseInt(props.lengths.payment_settings?.enabled)}
          >
            {cancelTimes.map((c,key) => {
              return <MenuItem key={key} value={c.value}>{c.title}</MenuItem>
            })}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </>);
};
