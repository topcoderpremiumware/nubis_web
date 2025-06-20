import eventBus from "./eventBus";
import moment from "moment";

export const normalizeNumber = (number) => (number < 10 ? `0${number}` : number);

export const generateFormData = (obj, form = new FormData(), namespace = '') => {
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    const formKey = namespace ? `${namespace}[${key}]` : key;

    if (value instanceof Date) {
      form.append(formKey, value.toISOString());
    } else if (value instanceof File || value instanceof Blob) {
      form.append(formKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${formKey}[${index}]`;

        if (typeof item === 'object' && item !== null) {
          generateFormData(item, form, arrayKey);
        } else {
          form.append(arrayKey, item);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      generateFormData(value, form, formKey);
    } else if (value !== undefined) {
      form.append(formKey, value);
    }
  }

  return form;
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

export const isBills = (bills, data = window, admin = true) => {
  return (admin && data.is_superadmin) || (data && data.bills && bills.some(b => data.bills.includes(b)))
}

export const defaultPageRedirect = () => {
  eventBus.dispatch('updateBills', () => {
    console.log('defaultPageRedirect')
    if(isBills(['full','booking'])){
      window.location.href = "/admin/DayView"
    }else if(isBills(['pos','pos_terminal'])){
      window.location.href = "/admin/POS"
    }else if(isBills(['giftcards'])){
      window.location.href = "/admin/GiftcardSettings"
    }else{
      window.location.href = "/admin/BasicInformation"
    }
  })
}
