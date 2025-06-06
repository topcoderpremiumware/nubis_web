import axios from "axios";
import eventBus from "./eventBus";

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
      paymentLogic(method, checkId, terminal, userId, data)
    }else if(['transaction'].includes(method)){
      let result = data.SaleToPOIResponse?.TransactionStatusResponse?.Response?.['@attributes']?.Result
      if(result === 'Success'){
        data = {SaleToPOIResponse: data?.SaleToPOIResponse?.TransactionStatusResponse?.RepeatedMessageResponse}
        let checkId = data?.SaleToPOIResponse?.PaymentResponse?.SaleData?.SaleTransactionID?.['@attributes']?.TransactionID
        paymentLogic('payment',checkId,terminal,userId,data)
        console.log('After paymentLogic')
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
    console.log('data after all',data)
    if(data.SaleToPOIResponse?.PaymentResponse?.PaymentReceipt){
      console.log('PaymentResponse print')
      data.SaleToPOIResponse?.PaymentResponse?.PaymentReceipt.forEach(paymentReceipt => {
        if(paymentReceipt['@attributes']?.DocumentQualifier === 'CustomerReceipt'){
          console.log('CustomerReceipt print')
          let c_receipt_text = JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64').toString());
          requestPrint(c_receipt_text?.Cardholder?.Optional?.ReceiptString, terminal, userId, 0)
        }
      })
    }
    if(data.SaleToPOIResponse?.ReversalResponse?.PaymentReceipt){
      console.log('ReversalResponse print')
      data.SaleToPOIResponse?.ReversalResponse?.PaymentReceipt.forEach(paymentReceipt => {
        if(paymentReceipt['@attributes']?.DocumentQualifier === 'CustomerReceipt'){
          console.log('CustomerReceipt print')
          let c_receipt_text = JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64').toString());
          requestPrint(c_receipt_text?.Cardholder?.Optional?.ReceiptString, terminal, userId, 0)
        }
      })
    }
  }else{
    event('terminal-error',{terminal: terminal, message: `Unknown ${method} error`});
  }
  return true;
}

async function paymentLogic(method, checkId, terminal, userId, data) {
  // 'Success' | 'Failure'
  let result = data.SaleToPOIResponse?.PaymentResponse?.Response?.['@attributes']?.Result
  if (result === 'Success') {
    for (const paymentReceipt of data.SaleToPOIResponse?.PaymentResponse?.PaymentReceipt) {
      console.log('SwedbankPayment::handle', {
        [paymentReceipt['@attributes']?.DocumentQualifier]: JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'], 'base64').toString())
      })
      if (paymentReceipt['@attributes']?.DocumentQualifier === 'CashierReceipt') {
        console.log('CashierReceipt')
        let merchant_receipt_text = JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'], 'base64').toString());
        if (merchant_receipt_text?.Merchant?.Mandatory?.Payment?.SignatureBlock) {
          console.log('CashierReceipt print')
          await requestPrint(merchant_receipt_text?.Merchant?.Optional?.ReceiptString, terminal, userId, 0)
          eventBus.dispatch("receiptNeedSignature")
        }
      }
      if (paymentReceipt['@attributes']?.DocumentQualifier === 'CustomerReceipt') {
        console.log('CustomerReceipt')
        let receipt_text = JSON.parse(Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'], 'base64'));
        console.log('CustomerReceipt', receipt_text)
        updateBankLog(checkId, receipt_text)
        console.log('CustomerReceipt after updateBankLog')
        event('terminal-paid', {
          terminal: terminal,
          message: `The order has been ${method === 'payment' ? 'paid' : 'refund'} by the terminal`
        });
        console.log('CustomerReceipt after event')
      }
    }
  } else {
    // 'Cancel' | 'Refusal' | 'NotAllowed'
    let condition = data.SaleToPOIResponse?.PaymentResponse?.Response?.['@attributes']?.ErrorCondition
    errorCondition(condition, method, terminal)
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

async function requestPrint(text, terminal, userId, sec) {
  return await new Promise((resolve) => {
    setTimeout(async () => {
      if (window.ipcRenderer) {
        resolve(await window.ipcRenderer.invoke('terminal_print', text, terminal, userId))
      }
      if (window.ReactNativeWebView) {
        resolve(window.ReactNativeWebView.postMessage(JSON.stringify({
          action: 'terminal_print',
          text: text,
          terminal: terminal,
          userId: userId
        })))
      }
    }, sec)
  })
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
