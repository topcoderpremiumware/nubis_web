import {useTranslation} from "react-i18next";
import {
  Alert,
  Button, Card, CardActions, CardContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import {simpleCatchError} from "../../../../helper";
import axios from "axios";
import eventBus from "../../../../eventBus";
import {qzTrayPrint} from "../../../../qzTray";

export default function TerminalPaymentForm(props){
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false)
  const [loadingRevert, setLoadingRevert] = useState(false)
  const [loadingAbort, setLoadingAbort] = useState(true)
  const [terminalErrors,  setTerminalErrors] = useState([])
  const [terminalDisplay,  setTerminalDisplay] = useState('Welcome')

  let channelName

  useEffect(() => {
    channelName = `place-${localStorage.getItem('place_id')}`
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
          setTerminalErrors(prev => ([...prev,{type: 'warning', message: t('Is customer signature OK?')}]))
        }
      })
    return () => {
      Echo.leave(channelName)
    }
  },[props.selectedTerminal])

  const sendTerminalPay = () => {
    setLoading(true)
    setLoadingAbort(false)
    setLoadingRevert(true)
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

  const sendTerminalRevert = () => {
    setLoadingRevert(true)
    setLoading(true)
    setLoadingAbort(false)
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

  const sendTerminalAbort = () => {
    setLoadingAbort(true)
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

  const openTerminalReceipt = (url) => {
    axios.post(url,{}, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      responseType: 'blob'
    }).then(response => {
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      qzTrayPrint(['receipts','all_prints'], pdfBlob, () => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        if(window.ReactNativeWebView){
          window.location.href = pdfUrl;
          window.ReactNativeWebView.postMessage('print_receipt');
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
   <Card sx={{mb: 2}}>
    <CardContent>{terminalDisplay}</CardContent>
    <CardActions>
      <Button
        variant="contained"
        disabled={loading}
        onClick={() => sendTerminalPay()}>{t('Pay')}</Button>
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
      <>{terminalErrors.map((e,i) => <Alert severity={e.type} action={e.type === 'warning' ?
        <>
          <Button color="inherit" size="small" onClick={() => sendResponse(true,i)}>{t('Yes')}</Button>
          <Button color="inherit" size="small" onClick={() => sendResponse(false,i)}>{t('No')}</Button>
        </> :
        <IconButton aria-label="close" color="inherit" size="small" onClick={() => removeError(i)}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      } sx={{ mb: 2 }} >{e.message}</Alert>)}</> : null}
  </>);
}
