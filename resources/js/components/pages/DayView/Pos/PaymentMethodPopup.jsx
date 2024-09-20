import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import {round} from "../../../../helper";

export default function PaymentMethodPopup(props){
  const {t} = useTranslation();
  const [data, setData] = useState({})
  const [users, setUsers] = useState([])

  useEffect(() => {
    setData({payment_method: 'card'})
    getUsers()
  },[props.open])

  const methods = [
    {value:'card',label:t('Card')},
    {value:'cash',label:t('Cash')},
    {value:'card/cash',label:t('Card / Cash')}
  ]

  const getUsers = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/users`,{
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }).then(response => {
      setUsers(response.data)
    }).catch(error => {
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'card_amount'){
      if(e.target.value <= props.total)
        setData(prev => ({
          ...prev,
          card_amount: round(e.target.value),
          cash_amount: round(props.total - e.target.value)
        }))
    }else if(e.target.name === 'cash_amount'){
      if(e.target.value <= props.total)
        setData(prev => ({
          ...prev,
          cash_amount: round(e.target.value),
          card_amount: round(props.total - e.target.value)
        }))
    }else{
      setData(prev => ({...prev, [e.target.name]: e.target.value}))
    }
  }

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
          <Select label={t('Payment method')} value={data.payment_method}
                  labelId="label_payment_method" id="payment_method" name="payment_method"
                  onChange={onChange}>
            {methods.map((el,key) => {
              return <MenuItem key={key} value={el.value}>{el.label}</MenuItem>
            })}
          </Select>
        </FormControl>
        {data.payment_method === 'card/cash' && <>
          <TextField label={t('Card amount')} size="small" fullWidth sx={{mb: 2}}
                     type="text" id="card_amount" name="card_amount" required
                     onChange={onChange}
                     value={data.card_amount}
                     InputProps={{
                       startAdornment: <InputAdornment position="start">{props.currency}</InputAdornment>,
                     }}
          />
          <TextField label={t('Cash amount')} size="small" fullWidth sx={{mb: 2}}
                     type="text" id="cash_amount" name="cash_amount" required
                     onChange={onChange}
                     value={data.cash_amount}
                     InputProps={{
                       startAdornment: <InputAdornment position="start">{props.currency}</InputAdornment>,
                     }}
          />
        </>}
        <FormControl size="small" fullWidth sx={{mb: 2}}>
          <InputLabel id="label_printed_id">{t('Cashier')}</InputLabel>
          <Select label={t('Cashier')} value={data.printed_id}
                  labelId="label_printed_id" id="printed_id" name="printed_id"
                  onChange={onChange}>
            {users.map((el,key) => {
              return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
            })}
          </Select>
        </FormControl>
        {data.printed_id &&
        <TextField label={t('PIN code')} size="small" fullWidth sx={{mb: 2}}
                   type="text" id="pin" name="pin" required
                   onChange={onChange} value={data.pin}
        />}
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="contained" onClick={() => props.onChange(data)}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
}
