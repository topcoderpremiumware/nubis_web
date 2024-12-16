import {getBase64FromFile} from "./helper";
const qz = require("qz-tray");
import {KEYUTIL, KJUR, stob64, hextorstr} from "jsrsasign";
import eventBus from "./eventBus";

export function qzTrayPrint(printerName, blob, errorCallback) {

  if(localStorage.getItem('qz_cert')){
    qz.security.setCertificatePromise(function(resolve, reject) {
      resolve(localStorage.getItem('qz_cert'))
    })
  }

  qz.security.setSignatureAlgorithm("SHA512")
  qz.security.setSignaturePromise(function(toSign) {
    return function(resolve, reject) {
      if(localStorage.getItem('qz_key')){
        try {
          let pk = KEYUTIL.getKey(localStorage.getItem('qz_key'))
          let sig = new KJUR.crypto.Signature({"alg": "SHA512withRSA"})
          sig.init(pk)
          sig.updateString(toSign)
          let hex = sig.sign()
          resolve(stob64(hextorstr(hex)))
        } catch (err) {
          console.error(err)
          reject(err)
        }
      }else{
        resolve()
      }
    }
  })

  let printerCustomerName = ''
  qz.websocket.connect().then(() => {
    return qz.printers.find(printerName);
  }).then(async (printer) => {
    printerCustomerName = printer
    let config = qz.configs.create(printer);
    let base64 = await getBase64FromFile(blob)
    return qz.print(config, [{
      type: 'pixel',
      format: 'pdf',
      flavor: 'base64',
      data: base64.split(',')[1]
    }]);
  }).then(() => {
    eventBus.dispatch("notification", {type: 'success', message: 'Document sent to the printer '+printerCustomerName})
    return qz.websocket.disconnect();
  }).catch((err) => {
    console.error('qzTray',err);
    errorCallback()
  });
}
