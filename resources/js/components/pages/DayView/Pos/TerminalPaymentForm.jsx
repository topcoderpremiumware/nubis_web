import {useTranslation} from "react-i18next";
import {
  Alert,
  Button, Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useRef, useState} from "react";
import {simpleCatchError} from "../../../../helper";
import axios from "axios";
import eventBus from "../../../../eventBus";
import {qzTrayPrint} from "../../../../qzTray";
import {localPrint} from "../../../../localPrint";
import {localBankTerminal} from "../../../../localBankTerminal";
import PayIcon from "../../../components/icons/PayIcon";
import ReversalIcon from "../../../components/icons/ReversalIcon";
import AbortIcon from "../../../components/icons/AbortIcon";
const printFunction = (window.ipcRenderer || window.ReactNativeWebView) ? localPrint : qzTrayPrint;

export default function TerminalPaymentForm(props){
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false)
  const [loadingRevert, setLoadingRevert] = useState(false)
  const [loadingAbort, setLoadingAbort] = useState(true)
  const [terminalErrors,  setTerminalErrors] = useState([])
  const [terminalDisplay,  setTerminalDisplay] = useState('Welcome')
  const terminalErrorsRef = useRef([])

  let channelName

  useEffect(() => {
    terminalErrorsRef.current = terminalErrors
    console.log('terminalErrorsRef.current',terminalErrorsRef.current.length)
  },[terminalErrors])

  useEffect(() => {
    channelName = `place-${localStorage.getItem('place_id')}`
    Echo.leave(channelName)
    Echo.channel(channelName)
      .listen('.terminal-paid', function(data) {
        if(data['terminal'].id === props.selectedTerminal.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(true)
          setTerminalErrors(prev => ([...prev,{type: 'success', message: t(data['message'])}]))
        }
      })
      .listen('.terminal-reverted', function(data) {
        if(data['terminal'].id === props.selectedTerminal.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(true)
          setTerminalErrors(prev => ([...prev,{type: 'success', message: t(data['message'])}]))
          eventBus.dispatch("madeReversal")
        }
      })
      .listen('.terminal-aborted', function(data) {
        if(data['terminal'].id === props.selectedTerminal.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(true)
          setTerminalErrors(prev => ([...prev,{type: 'success', message: t(data['message'])}]))
        }
      })
      .listen('.terminal-error', function(data) {
        if(data['terminal'].id === props.selectedTerminal.id){
          setLoading(false)
          setLoadingRevert(false)
          setLoadingAbort(true)
          setTerminalErrors(prev => ([...prev,{type: 'error', message: t(data['message'])}]))
        }
      })
      .listen('.terminal-display', function(data) {
        console.log('terminal-display',data)
        if(data['terminal'].id === props.selectedTerminal.id){
          if(data['code'] !== 11){
            setTerminalDisplay(prev => t(data['message']))
          }
        }
      })
      .listen('.terminal-print-data', function(data) {
        console.log('terminal-print-data',data)
        if(data['terminal'].id === props.selectedTerminal.id){
          openTerminalReceipt(data['url'])
          let index = terminalErrorsRef.current.length
          setTerminalErrors(prev => ([...prev,{type: 'warning', message: t('Is customer signature OK?'), action: <>
              <div>{terminalDisplay}</div>
              <Button color="inherit" size="small" onClick={() => sendResponse(true,index)}>{t('Yes')}</Button>
              <Button color="inherit" size="small" onClick={() => sendResponse(false,index)}>{t('No')}</Button>
            </>
          }]))
        }
      })
      function receiptNeedSignature(){
        let index = terminalErrorsRef.current.length
        setTerminalErrors(prev => ([...prev,{type: 'warning', message: t('Is customer signature OK?'), action: <>
            <Button color="inherit" size="small" onClick={() => removeError(index)}>{t('OK')}</Button>
          </>
        }]))
      }
      eventBus.on("receiptNeedSignature",receiptNeedSignature)
    return () => {
      Echo.leave(channelName)
      eventBus.remove("receiptNeedSignature",receiptNeedSignature)
    }
  },[props.selectedTerminal])

  const checkData = () => {
    if(!props.selectedTerminal){
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

  const sendTerminalPay = () => {
    if(loading) return
    if(!checkData()) return
    setLoading(true)
    setLoadingAbort(false)
    setLoadingRevert(true)
    if(window.ipcRenderer || window.ReactNativeWebView){
      localBankTerminal('payment', props.check_id, props.selectedTerminal, window.user_id, props.amount)
    }else{
      axios.post(`${process.env.MIX_API_URL}/api/terminals/${props.selectedTerminal.id}/pay`, {
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
      localBankTerminal('revert', props.check_id, props.selectedTerminal, window.user_id)
    }else{
      axios.post(`${process.env.MIX_API_URL}/api/terminals/${props.selectedTerminal.id}/revert`, {
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
      localBankTerminal('abort', props.check_id, props.selectedTerminal, window.user_id)
    }else {
      axios.post(`${process.env.MIX_API_URL}/api/terminals/${props.selectedTerminal.id}/abort`, {
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
    console.log('removeError',index,terminalErrorsRef.current.length)
    let errors = terminalErrorsRef.current
    errors.splice(index, 1)
    setTerminalErrors(prev => ([...errors]))
  }

  const sendResponse = (variant, index) => {
    axios.post(`${process.env.MIX_API_URL}/api/terminals/${props.selectedTerminal.id}/input`, {
      check_id: props.check_id,
      value: variant ? 'True' : 'False'
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      removeError(index)
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  return (<>
    <Grid container spacing={2} sx={{mb: 3}}>
      <Grid item xs={12} sm={4}>
        <div className={`paymentButton success ${loading ? 'disabled' : ''}`}
             onClick={() => sendTerminalPay()}>
          <div className="label">{t('Pay')}</div>
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
    {terminalErrors.length > 0 ? <>
        {terminalErrors.map((e,i) => <Alert key={i} severity={e.type} action={e.type === 'warning' ?
        e.action :
        <IconButton aria-label="close" color="inherit" size="small" onClick={() => removeError(i)}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      } sx={{ mb: 2 }} >{e.message}</Alert>)}</> : null}
  </>);
}
