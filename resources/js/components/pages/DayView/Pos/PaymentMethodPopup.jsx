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
import {round, simpleCatchError} from "../../../../helper";
import axios from "axios";
import TerminalPaymentForm from "./TerminalPaymentForm";
import eventBus from "../../../../eventBus";

export default function PaymentMethodPopup(props){
  const {t} = useTranslation();
  const [data, setData] = useState({})
  const [users, setUsers] = useState([])
  const [terminals, setTerminals] = useState([])
  const [selectedTerminal, setSelectedTerminal] = useState({})
  const [printType, setPrintType] = useState('proforma')

  useEffect(() => {
    setData({payment_method: 'card'})
    getUsers()
    getTerminals()
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

  const getTerminals = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/terminals`,{
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }).then(response => {
      setTerminals(response.data)
      if(response.data.length === 1) setSelectedTerminal(response.data[0])
    }).catch(error => {
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'card_amount'){
      if(e.target.value <= props.check.total)
        setData(prev => ({
          ...prev,
          card_amount: round(e.target.value),
          cash_amount: round(props.check.total - e.target.value)
        }))
    }else if(e.target.name === 'cash_amount'){
      if(e.target.value <= props.check.total)
        setData(prev => ({
          ...prev,
          cash_amount: round(e.target.value),
          card_amount: round(props.check.total - e.target.value)
        }))
    }else{
      setData(prev => ({...prev, [e.target.name]: e.target.value}))
    }
  }

  const printProforma = () => {
    axios.post(`${process.env.MIX_API_URL}/api/checks/${props.check.id}/proforma`, {...props.check, ...data}, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("openReceiptPDF")
      props.onClose()
    }).catch(error => {
      simpleCatchError(error)
    })
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
        <>{t('Print receipt')}</>
        <IconButton onClick={props.onClose} sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <FormControl size="small" fullWidth sx={{mb: 2}}>
          <InputLabel id="label_print_type">{t('Print type')}</InputLabel>
          <Select label={t('Print type')} value={printType}
                  labelId="label_print_type" id="print_type" name="print_type"
                  onChange={(e) => setPrintType(e.target.value)}>
            {['proforma','payment'].map((el,key) => {
              return <MenuItem key={key} value={el}>{el}</MenuItem>
            })}
          </Select>
        </FormControl>
        {printType === 'payment' ? <>
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
          {['card/cash','card'].includes(data.payment_method) ? <>
            {terminals.length > 1 ?
              <FormControl size="small" fullWidth sx={{mb: 2}}>
                <InputLabel id="label_terminal">{t('Terminal')}</InputLabel>
                <Select label={t('Terminal')} value={selectedTerminal}
                        labelId="label_terminal" id="terminal" name="terminal"
                        onChange={(e) => setSelectedTerminal(e.target.value)}>
                  {terminals.map((el,key) => {
                    return <MenuItem key={key} value={el.id}>{el.serial}</MenuItem>
                  })}
                </Select>
              </FormControl> : null}
            {selectedTerminal ? <TerminalPaymentForm
              selectedTerminal={selectedTerminal}
              check_id={props.check.id}
              amount={data.payment_method === 'card' ? props.check.total : data.card_amount}
            /> : null}
          </> : null}
        </> : null}
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
        {printType === 'proforma' ?
          <Button variant="contained" onClick={printProforma}>{t('Print')}</Button>
          :
          <Button variant="contained" onClick={() => props.onChange(data)}>{t('Save')}</Button>
        }
      </DialogActions>
    </Dialog>
  );
}
