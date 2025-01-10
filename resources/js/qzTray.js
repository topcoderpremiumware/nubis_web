import {getBase64FromFile} from "./helper";
const qz = require("qz-tray");
import {KEYUTIL, KJUR, stob64, hextorstr} from "jsrsasign";
import eventBus from "./eventBus";

export async function qzTrayPrint(printerNames, blob, errorCallback) {

  if (localStorage.getItem('qz_cert')) {
    qz.security.setCertificatePromise(function (resolve, reject) {
      resolve(localStorage.getItem('qz_cert'))
    })
  }

  qz.security.setSignatureAlgorithm("SHA512")
  qz.security.setSignaturePromise(function (toSign) {
    return function (resolve, reject) {
      if (localStorage.getItem('qz_key')) {
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
      } else {
        resolve()
      }
    }
  })

  let server_ip = localStorage.getItem('qz_print_server_ip')
  let server_secure = localStorage.getItem('qz_print_server_secure') || false
  let options = {host: (server_ip && server_ip !== 'null') ? server_ip : 'localhost', usingSecure: !!server_secure}
  console.log('qz_options',options)
  if (!qz.websocket.isActive()) await qz.websocket.connect(options).catch((err) => {
    console.error('qzTray connection', err);
  })
  let printed = false
  for (const printerName of printerNames) {
    if(!printed){
      try{
        const printer = await qz.printers.find(printerName)
        const config = qz.configs.create(printer)
        const base64 = await getBase64FromFile(blob)

        await qz.print(config, [{
          type: 'pixel',
          format: 'pdf',
          flavor: 'base64',
          data: base64.split(',')[1]
        }])

        eventBus.dispatch("notification", {type: 'success', message: 'Document sent to the printer ' + printer})
        printed = true
        await qz.websocket.disconnect();
      }catch(err){
        console.error('qzTray print', err);
      }
    }
  }
  if(!printed) errorCallback()
}
