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

function clearNumber(value = "") {
  return value.replace(/\D+/g, "");
}

export function formatCreditCardNumber(value) {
  if (!value) {
    return value;
  }

  const clearValue = clearNumber(value);
  const nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
    4,
    8
  )} ${clearValue.slice(8, 12)} ${clearValue.slice(12, 16)}`;

  return nextValue.trim();
}

export function formatCVC(value) {
  const clearValue = clearNumber(value);
  let maxLength = 3;

  return clearValue.slice(0, maxLength);
}

export function formatExpirationDate(value) {
  const clearValue = clearNumber(value);

  if (clearValue.length >= 3) {
    return `${clearValue.slice(0, 2)}/${clearValue.slice(2, 4)}`;
  }

  return clearValue;
}

export function formatFormData(data) {
  return Object.keys(data).map(d => `${d}: ${data[d]}`);
}
