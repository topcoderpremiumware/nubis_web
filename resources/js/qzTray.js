import {getBase64FromFile} from "./helper";
const qz = require("qz-tray");

export function qzTrayPrint(printerName, blob, errorCallback) {
  qz.websocket.connect().then(() => {
    return qz.printers.find(printerName);
  }).then(async (printer) => {
    let config = qz.configs.create(printer);
    let base64 = await getBase64FromFile(blob)
    return qz.print(config, [{
      type: 'pixel',
      format: 'pdf',
      flavor: 'base64',
      data: base64.split(',')[1]
    }]);
  }).then(() => {
    return qz.websocket.disconnect();
  }).catch((err) => {
    console.error('qzTray',err);
    errorCallback()
  });
}
