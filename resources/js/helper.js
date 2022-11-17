export const normalizeNumber = (number) => (number < 10 ? `0${number}` : number);

export const generateFormData = data => {
  const formData = new FormData()

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (Array.isArray(value) && value.length) {
        value.forEach(i => {
          formData.append(key, i)
        })
      } else {
        formData.append(key, value)
      }
    }
  }

  return formData
}