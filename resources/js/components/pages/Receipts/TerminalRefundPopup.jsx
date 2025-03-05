import {useTranslation} from "react-i18next";
import {
  Alert,
  Button, Card, CardActions, CardContent, Dialog, DialogContent, DialogTitle, FormControl, Grid,
  IconButton, InputLabel, MenuItem, Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useRef, useState} from "react";
import {simpleCatchError} from "../../../helper";
import axios from "axios";
import {qzTrayPrint} from "../../../qzTray";
import {localPrint} from "../../../localPrint";
import {localBankTerminal} from "../../../localBankTerminal";
import eventBus from "../../../eventBus";
import PayIcon from "../../components/icons/PayIcon";
import ReversalIcon from "../../components/icons/ReversalIcon";
import AbortIcon from "../../components/icons/AbortIcon";
const printFunction = (window.ipcRenderer || window.ReactNativeWebView) ? localPrint : qzTrayPrint;

export default function TerminalRefundPopup(props){
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false)
  const [loadingRevert, setLoadingRevert] = useState(false)
  const [loadingAbort, setLoadingAbort] = useState(true)
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
          setLoadingAbort(true)
          setTerminalErrors(prev => ([...prev,{type: 'success', message: t(data['message'])}]))
        }
      })
      .listen('.terminal-reverted', function(data) {
        if(data['terminal'].id === selectedTerminalRef.current.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(true)
          setTerminalErrors(prev => ([...prev,{type: 'success', message: t(data['message'])}]))
        }
      })
      .listen('.terminal-aborted', function(data) {
        if(data['terminal'].id === selectedTerminalRef.current.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(true)
          setTerminalErrors(prev => ([...prev,{type: 'success', message: t(data['message'])}]))
        }
      })
      .listen('.terminal-error', function(data) {
        if(data['terminal'].id === selectedTerminalRef.current.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(true)
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
    function receiptNeedSignature(){
      alert(t('The receipt requires a customer signature. Please ensure the client has signed the receipt before proceeding.'))
    }
    eventBus.on("receiptNeedSignature",receiptNeedSignature)
    return () => {
      Echo.leave(channelName)
      eventBus.remove("receiptNeedSignature",receiptNeedSignature)
    }
  },[props.open])

  useEffect(() => {
    selectedTerminalRef.current = selectedTerminal
  },[selectedTerminal])

  const handleClose = () => {
    if(window.ipcRenderer || window.ReactNativeWebView){
      localBankTerminal('abort', props.check_id, selectedTerminal, window.user_id)
    }
    props.onClose()
  }

  const checkData = () => {
    if(!selectedTerminal.hasOwnProperty('id')){
      eventBus.dispatch("notification", {type: 'error', message: 'Terminal is not selected'});
      return false
    }
    if(!props.check_id){
      eventBus.dispatch("notification", {type: 'error', message: 'Check is not selected'});
      return false
    }
    if(!props.amount){
      eventBus.dispatch("notification", {type: 'error', message: 'Amount is not set'});
      return false
    }
    return true
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
    if(loading) return
    if(!checkData()) return
    setLoading(true)
    setLoadingAbort(false)
    setLoadingRevert(true)
    if(window.ipcRenderer || window.ReactNativeWebView){
      localBankTerminal('refund', props.check_id, selectedTerminal, window.user_id, props.amount)
    }else {
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
  }

  const sendTerminalRevert = () => {
    if(loadingRevert) return
    if(!checkData()) return
    setLoadingRevert(true)
    setLoading(true)
    setLoadingAbort(false)
    if(window.ipcRenderer || window.ReactNativeWebView){
      localBankTerminal('revert', props.check_id, selectedTerminal, window.user_id)
    }else {
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
  }

  const sendTerminalAbort = () => {
    if(loadingAbort) return
    if(!checkData()) return
    setLoadingAbort(true)
    if(window.ipcRenderer || window.ReactNativeWebView){
      localBankTerminal('abort', props.check_id, selectedTerminal, window.user_id)
    }else {
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
  }

  const openTerminalReceipt = (url) => {
    axios.post(url,{}, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      responseType: 'blob'
    }).then(response => {
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      printFunction(['receipts','all_prints'], pdfBlob, () => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        if(window.ReactNativeWebView){
          window.location.href = pdfUrl;
          window.ReactNativeWebView.postMessage(JSON.stringify({action: 'print_receipt'}));
        }else{
          window.open(pdfUrl, '_blank');
          URL.revokeObjectURL(pdfUrl);
        }
      })
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
        <>{t('Refund by terminal')}</>
        <IconButton onClick={handleClose} sx={{
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
            <Select label={t('Terminal')} value={selectedTerminal.id}
                    labelId="label_terminal" id="terminal" name="terminal"
                    onChange={(e) => setSelectedTerminal(terminals.find(o => o.id === e.target.value))}>
              {terminals.map((el,key) => {
                return <MenuItem key={key} value={el.id}>{el.serial}</MenuItem>
              })}
            </Select>
          </FormControl> : null}
        <Grid container spacing={2} sx={{mb: 3}}>
          <Grid item xs={12} sm={4}>
            <div className={`paymentButton success ${loading ? 'disabled' : ''}`}
                 onClick={() => sendTerminalRefund()}>
              <div className="label">{t('Refund')}</div>
              <PayIcon/>
            </div>
          </Grid>
          <Grid item xs={12} sm={4}>
            <div className={`paymentButton warning ${loadingRevert ? 'disabled' : ''}`}
                 onClick={() => sendTerminalRevert()}>
              <div className="label">{t('Reversal')}</div>
              <ReversalIcon/>
            </div>
          </Grid>
          <Grid item xs={12} sm={4}>
            <div className={`paymentButton error ${loadingAbort ? 'disabled' : ''}`}
                 onClick={() => sendTerminalAbort()}>
              <div className="label">{t('Abort')}</div>
              <AbortIcon/>
            </div>
          </Grid>
        </Grid>
        {terminalErrors.length > 0 ?
          <>{terminalErrors.map((e,i) => <Alert key={i} severity={e.type} action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={() => removeError(i)}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          } sx={{ mb: 2 }} >{e.message}</Alert>)}</> : null}
      </DialogContent>
    </Dialog>);
}
