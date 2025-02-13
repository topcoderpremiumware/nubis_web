import axios from "axios";

export async function localBankTerminal(method, checkId, terminal, userId, amount = 0) {
  console.log('localBankTerminal',method,checkId,terminal,userId,amount)
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
    console.log('send action to react native',method)
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
  console.log('get action from react native',method,data)
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
            console.log('SwedbankPayment text',paymentReceipt.OutputContent?.OutputText?.['#text'])
            console.log('SwedbankPayment buffer',Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64').toString())
            let merchant_receipt_text = JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64').toString());
            console.log('SwedbankPayment merchant_receipt_text',merchant_receipt_text)
            console.log('SwedbankPayment Merchant',merchant_receipt_text?.Merchant)
            console.log('SwedbankPayment Mandatory',merchant_receipt_text?.Merchant?.Mandatory)
            console.log('SwedbankPayment Payment',merchant_receipt_text?.Merchant?.Mandatory?.Payment)
            console.log('SwedbankPayment SignatureBlock',merchant_receipt_text?.Merchant?.Mandatory?.Payment?.SignatureBlock)
            if(merchant_receipt_text?.Merchant?.Mandatory?.Payment?.SignatureBlock){
              requestPrint(merchant_receipt_text?.Merchant?.Optional?.ReceiptString, terminal, userId)
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
          case 'Aborted':
            event('terminal-error',{terminal: terminal, message: `The ${method} was aborted`});
            break;
          default:
            event('terminal-error',{terminal: terminal, message: `Unknown ${method} error: ${condition}`});
        }
      }
    }else if(['abort','revert'].includes(method)){
      event(`terminal-${method === 'abort' ? 'aborted' : 'reverted'}`,{terminal: terminal, message: `The payment has been ${method === 'abort' ? 'aborted' : 'reverted'} by the terminal`});
    }
    if(data.SaleToPOIResponse?.PaymentResponse?.PaymentReceipt){
      data.SaleToPOIResponse?.PaymentResponse?.PaymentReceipt.forEach(paymentReceipt => {
        if(paymentReceipt['@attributes']?.DocumentQualifier === 'CustomerReceipt'){
          let c_receipt_text = JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64').toString());
          requestPrint(c_receipt_text?.Cardholder?.Optional?.ReceiptString, terminal, userId)
        }
      })
    }
  }else{
    event('terminal-error',{terminal: terminal, message: `Unknown ${method} error`});
  }
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

function requestPrint(text, terminal, userId){
  if(window.ipcRenderer){
    window.ipcRenderer.invoke('terminal_print', text, terminal, userId)
  }
  if(window.ReactNativeWebView){
    window.ReactNativeWebView.postMessage(JSON.stringify({action: terminal_print, text: text, terminal: terminal, userId: userId}))
  }
}
