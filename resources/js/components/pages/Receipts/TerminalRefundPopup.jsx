import {useTranslation} from "react-i18next";
import {
  Alert,
  Button, Card, CardActions, CardContent, Dialog, DialogContent, DialogTitle, FormControl,
  IconButton, InputLabel, MenuItem, Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useRef, useState} from "react";
import {simpleCatchError} from "../../../helper";
import axios from "axios";

export default function TerminalRefundPopup(props){
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false)
  const [loadingRevert, setLoadingRevert] = useState(false)
  const [loadingAbort, setLoadingAbort] = useState(false)
  const [terminalErrors,  setTerminalErrors] = useState([])
  const [terminalDisplay,  setTerminalDisplay] = useState('Welcome')
  const [terminals, setTerminals] = useState([])
  const [selectedTerminal, setSelectedTerminal] = useState({})
  const selectedTerminalRef = useRef(selectedTerminal)

  let channelName

  useEffect(() => {
    getTerminals()
    channelName = `place-${localStorage.getItem('place_id')}`
    Echo.channel(channelName)
      .listen('.terminal-paid', function(data) {
        if(data['terminal'].id === selectedTerminalRef.current.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(false)
          setTerminalErrors(prev => ([...prev,{type: 'success', message: t(data['message'])}]))
        }
      })
      .listen('.terminal-reverted', function(data) {
        if(data['terminal'].id === selectedTerminalRef.current.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(false)
          setTerminalErrors(prev => ([...prev,{type: 'success', message: t(data['message'])}]))
        }
      })
      .listen('.terminal-aborted', function(data) {
        if(data['terminal'].id === selectedTerminalRef.current.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(false)
          setTerminalErrors(prev => ([...prev,{type: 'success', message: t(data['message'])}]))
        }
      })
      .listen('.terminal-error', function(data) {
        if(data['terminal'].id === selectedTerminalRef.current.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(false)
          setTerminalErrors(prev => ([...prev,{type: 'error', message: t(data['message'])}]))
        }
      })
      .listen('.terminal-display', function(data) {
        console.log('terminal-display',data)
        if(data['terminal'].id === selectedTerminalRef.current.id){
          if(data['code'] !== 11){
            setTerminalDisplay(prev => t(data['message']))
          }
        }
      })
      .listen('.terminal-print-data', function(data) {
        console.log('terminal-print-data',data)
        if(data['terminal'].id === selectedTerminalRef.current.id){
          openTerminalReceipt(data['url'])
          setTerminalErrors(prev => ([...prev,{type: 'warning', message: t('Is customer signature OK?')}]))
        }
      })
    return () => {
      Echo.leave(channelName)
    }
  },[props.open])

  useEffect(() => {
    selectedTerminalRef.current = selectedTerminal
  },[selectedTerminal])

  const handleClose = () => {
    props.onClose()
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

  const sendTerminalRefund = () => {
    setLoading(true)
    axios.post(`${process.env.MIX_API_URL}/api/terminals/${selectedTerminal.id}/refund`, {
      amount: props.amount,
      check_id: props.check_id
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const sendTerminalRevert = () => {
    setLoadingRevert(true)
    axios.post(`${process.env.MIX_API_URL}/api/terminals/${selectedTerminal.id}/revert`, {
      check_id: props.check_id
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const sendTerminalAbort = () => {
    setLoadingAbort(true)
    axios.post(`${process.env.MIX_API_URL}/api/terminals/${selectedTerminal.id}/abort`, {
      check_id: props.check_id
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const openTerminalReceipt = (url) => {
    axios.post(url,{}, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      responseType: 'blob'
    }).then(response => {
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      URL.revokeObjectURL(pdfUrl);
      if(window.ReactNativeWebView){
        window.ReactNativeWebView.postMessage('print_receipt');
      }
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const removeError = (index) => {
    let errors = terminalErrors
    errors.splice(index, 1)
    setTerminalErrors(prev => ([...errors]))
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
        <>{t('Refund by terminal')}</>
        <IconButton onClick={props.onClose} sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent dividers>
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
        <Card sx={{mb: 2}}>
          <CardContent>{terminalDisplay}</CardContent>
          <CardActions>
            <Button
              variant="contained"
              disabled={loading}
              onClick={() => sendTerminalRefund()}>{t('Refund')}</Button>
            <Button
              variant="contained"
              color="warning"
              disabled={loadingRevert}
              onClick={() => sendTerminalRevert()}>{t('Revert')}</Button>
            <Button
              variant="contained"
              color="error"
              disabled={loadingAbort}
              onClick={() => sendTerminalAbort()}>{t('Abort')}</Button>
          </CardActions>
        </Card>
        {terminalErrors.length > 0 ?
          <>{terminalErrors.map((e,i) => <Alert severity={e.type} action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={() => removeError(i)}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          } sx={{ mb: 2 }} >{e.message}</Alert>)}</> : null}
      </DialogContent>
    </Dialog>);
}
