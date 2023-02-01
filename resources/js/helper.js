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
