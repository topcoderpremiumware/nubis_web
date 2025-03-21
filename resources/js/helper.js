import eventBus from "./eventBus";
import moment from "moment";

export const normalizeNumber = (number) => (number < 10 ? `0${number}` : number);

export const generateFormData = data => {
  const formData = new FormData()

  for (const [key, value] of Object.entries(data)) {
    console.log('formData',key, value)
    if (value !== undefined) {
      if (Array.isArray(value)) {
        if(value.length){
          value.forEach(i => {
            let i_temp = typeof i == 'object' ? JSON.stringify(i) : i
            formData.append(key+'[]', i_temp)
          })
        }else{
          formData.append(key+'[]', null)
        }
      } else {
        let value_temp = typeof value == 'object' ? JSON.stringify(value) : value
        formData.append(key, value_temp)
      }
    }
  }

  return formData
}

export function formatFormData(data) {
  return Object.keys(data).map(d => `${d}: ${data[d]}`);
}

export function isMobile() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

export function isIPad() {
  const toMatch = [
    /iPad/i
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

export const simpleCatchError = (error) => {
  if (error.response && error.response.data && error.response.data.errors) {
    for (const [key, value] of Object.entries(error.response.data.errors)) {
      eventBus.dispatch("notification", {type: 'error', message: value});
    }
  } else if (error.response && error.response.data && error.response.data.message) {
    eventBus.dispatch("notification", {type: 'error', message: error.response.data.message});
  } else {
    eventBus.dispatch("notification", {type: 'error', message: error.message});
    console.log('Error', error.message)
  }
}

export const getBase64FromUrl = (url) => {
  return new Promise((resolve, reject) => {
    if(!url) resolve('')
    let img = document.createElement('img');
    img.src = url;
    img.onload = function () {
      let canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      let dataURL = canvas.toDataURL("image/png");
      // resolve(dataURL.replace(/^data:image\/?[A-z]*;base64,/,''))
      resolve(dataURL)
    }
  })
}

export const getBase64FromFile = (file) => {
  return new Promise((resolve, reject) => {
    if(!file) resolve('')
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  })
}

export const datetimeFormat = (string) => {
  if(!string) return ''
  return moment.utc(string).local().format('DD-MM-YYYY HH:mm')
}

export const round = (value) => {
  if(!value && value !== 0) return ''
  if(String(value).endsWith('.') || String(value).endsWith('.0')) return value
  return Math.round(value*100)/100
}

export const currency_format = (number) => {
  return (number).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

export const isBills = (bills, data = window) => {
  return data.bills && bills.some(b => data.bills.includes(b))
}
