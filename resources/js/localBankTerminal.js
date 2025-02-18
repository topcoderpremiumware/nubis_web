import axios from "axios";

export async function localBankTerminal(method, checkId, terminal, userId, amount = 0) {
  // For Electron
  let data
  if(window.ipcRenderer){
    if(amount){
      data = await window.ipcRenderer.invoke(method, amount, checkId, terminal, userId)
    }else{
      data = await window.ipcRenderer.invoke(method, checkId, terminal, userId)
    }
  }
  // For react native
  if(window.ReactNativeWebView){
    if(amount){
      window.ReactNativeWebView.postMessage(JSON.stringify({action: method, amount: amount, checkId: checkId, terminal: terminal, userId: userId}))
    }else{
      window.ReactNativeWebView.postMessage(JSON.stringify({action: method, checkId: checkId, terminal: terminal, userId: userId}))
    }
  }

  if(window.ipcRenderer) {
    window.terminalAnswer(method, checkId, terminal, userId, data)
  }
}

window.terminalAnswer = (method, checkId, terminal, userId, data) => {
  if(data){
    if(['payment','refund'].includes(method)){
      // 'Success' | 'Failure'
      let result = data.SaleToPOIResponse?.PaymentResponse?.Response?.['@attributes']?.Result
      if(result === 'Success'){
        let receipt_text = '';
        data.SaleToPOIResponse?.PaymentResponse?.PaymentReceipt.forEach(paymentReceipt => {
          console.log('SwedbankPayment::handle',{
            [paymentReceipt['@attributes']?.DocumentQualifier]: JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64').toString())
          })
          if(paymentReceipt['@attributes']?.DocumentQualifier === 'CashierReceipt'){
            let merchant_receipt_text = JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64').toString());
            if(merchant_receipt_text?.Merchant?.Mandatory?.Payment?.SignatureBlock){
              requestPrint(merchant_receipt_text?.Merchant?.Optional?.ReceiptString, terminal, userId,3000)
            }
          }
          if(paymentReceipt['@attributes']?.DocumentQualifier === 'CustomerReceipt'){
            receipt_text = JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64'));
            updateBankLog(checkId,receipt_text)
            event('terminal-paid',{terminal: terminal, message: `The order has been ${method === 'payment' ? 'paid' : 'refund'} by the terminal`});
          }
        })
      }else{
        // 'Cancel' | 'Refusal' | 'NotAllowed'
        let condition = data.SaleToPOIResponse?.PaymentResponse?.Response?.['@attributes']?.ErrorCondition
        errorCondition(condition,method,terminal)
      }
    }else if(['revert'].includes(method)){
      let result = data.SaleToPOIResponse?.ReversalResponse?.Response?.['@attributes']?.Result
      if(result === 'Success'){
        event(`terminal-reverted`,{terminal: terminal, message: `The payment has been reversed by the terminal`});
      }else{
        let condition = data.SaleToPOIResponse?.ReversalResponse?.Response?.['@attributes']?.ErrorCondition
        errorCondition(condition,method,terminal)
      }
    }else if(['abort'].includes(method)){
      event(`terminal-aborted`,{terminal: terminal, message: `The payment has been aborted by the terminal`});
    }
    if(data.SaleToPOIResponse?.PaymentResponse?.PaymentReceipt){
      data.SaleToPOIResponse?.PaymentResponse?.PaymentReceipt.forEach(paymentReceipt => {
        if(paymentReceipt['@attributes']?.DocumentQualifier === 'CustomerReceipt'){
          let c_receipt_text = JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64').toString());
          requestPrint(c_receipt_text?.Cardholder?.Optional?.ReceiptString, terminal, userId, 9000)
        }
      })
    }
    if(data.SaleToPOIResponse?.ReversalResponse?.PaymentReceipt){
      data.SaleToPOIResponse?.ReversalResponse?.PaymentReceipt.forEach(paymentReceipt => {
        if(paymentReceipt['@attributes']?.DocumentQualifier === 'CustomerReceipt'){
          let c_receipt_text = JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64').toString());
          requestPrint(c_receipt_text?.Cardholder?.Optional?.ReceiptString, terminal, userId, 9000)
        }
      })
    }
  }else{
    event('terminal-error',{terminal: terminal, message: `Unknown ${method} error`});
  }
  return true;
}

function event(name, data){
  axios.post(`${process.env.MIX_API_URL}/api/websocket/from_client`, {
    channel: `place-${localStorage.getItem('place_id')}`,
    event: name,
    data: data
  }, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    }
  })
}

function updateBankLog(checkId,log){
  axios.post(`${process.env.MIX_API_URL}/api/checks/${checkId}/update_bank_log`, {
    bank_log: log
  }, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    }
  })
}

function requestPrint(text, terminal, userId, sec){
  setTimeout(function(){
    if(window.ipcRenderer){
      window.ipcRenderer.invoke('terminal_print', text, terminal, userId)
    }
    if(window.ReactNativeWebView){
      window.ReactNativeWebView.postMessage(JSON.stringify({action: 'terminal_print', text: text, terminal: terminal, userId: userId}))
    }
  },sec)
}

function errorCondition(condition,method,terminal){
  switch (condition){
    case 'Cancel':
      event('terminal-error',{terminal: terminal, message: `The ${method} was cancelled`});
      break;
    case 'Refusal':
      event('terminal-error',{terminal: terminal, message: `The ${method} was refused`});
      break;
    case 'NotAllowed':
      event('terminal-error',{terminal: terminal, message: `The ${method} was not allowed without auth`});
      break;
    case 'NotFound':
      event('terminal-error',{terminal: terminal, message: `The ${method === 'revert' ? 'reversal' : method} was not found`});
      break;
    case 'Aborted':
      event('terminal-error',{terminal: terminal, message: `The ${method} was aborted`});
      break;
    default:
      event('terminal-error',{terminal: terminal, message: `Unknown ${method} error: ${condition}`});
  }
}
