import {getBase64FromFile} from "./helper";
import eventBus from "./eventBus";

export async function localPrint(printerNames, blob, errorCallback) {
  let printed = false
  // For Electron
  if(window.ipcRenderer){
    for (const printerName of printerNames) {
      if(!printed){
        try{
          const printer = await window.ipcRenderer.invoke('find-printer', printerName)
          console.log('local print found printer',printer)

          if(printer){
            const base64 = await getBase64FromFile(blob)
            window.ipcRenderer.invoke('print-document', base64, printer)
            eventBus.dispatch("notification", {type: 'success', message: 'Document sent to the printer ' + printer})
            printed = true
          }
        }catch(err){
          console.error('local print', err);
        }
      }
    }
  }
  // For react native
  if(window.ReactNativeWebView){
    const base64 = await getBase64FromFile(blob)
    window.ReactNativeWebView.postMessage(JSON.stringify({action: 'print-document', printers: printerNames, base64: base64}))
    eventBus.dispatch("notification", {type: 'success', message: 'Document sent to the printer'})
    printed = true
  }

  if(!printed) errorCallback()
}
