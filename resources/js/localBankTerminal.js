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
    window.terminalAnswer(method, data)
  }
}

window.terminalAnswer = (method, data) => {
  console.log('get action from react native',method,data)
  if(data){
    if(['payment','refund'].includes(method)){
      // 'Success' | 'Failure'
      let result = data.SaleToPOIResponse?.PaymentResponse?.Response?.['@attributes']?.Result
      if(result === 'Success'){
        let receipt_text = '';
        data.SaleToPOIResponse?.PaymentResponse?.PaymentReceipt.forEach(paymentReceipt => {
          console.log('SwedbankPayment::handle',{
            [paymentReceipt['@attributes']?.DocumentQualifier]: Buffer.from(paymentReceipt.OutputContent?.OutputText?.['#text'],'base64')
          })
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
