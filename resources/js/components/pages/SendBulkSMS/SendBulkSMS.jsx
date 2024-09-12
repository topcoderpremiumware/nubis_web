import React, {useEffect, useState} from "react";
import  './SendBulkSMS.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import {Button, FormControl, InputLabel,Stack, MenuItem, Select, TextField} from "@mui/material";

const options = [
  "#RESTAURANT_ADDRESS#",
  "#RESTAURANT_CITY#",
  "#RESTAURANT_COUNTRY#",
  "#RESTAURANT_EMAIL#",
  "#RESTAURANT_HOMEPAGE#",
  "#RESTAURANT_NAME#",
  "#RESTAURANT_PHONE#",
  "#RESTAURANT_ZIPCODE#"
]
export default function SendBulkSMS() {
  const { t } = useTranslation();

  const [text, setText] = useState('')
  const [textError, setTextError] = useState([])
  const [caretPosition, setCaretPosition] = useState(null)
  const [recipientType, setRecipientType] = useState('')
  const [recipientCount, setRecipientCount] = useState(0)

  useEffect(() => {
    eventBus.on("placeChanged",  () => {

    })
  },[])

  useEffect(() => {
    if(recipientType){
      getTypeCount()
    }
  },[recipientType])

  const getTypeCount = () => {
    axios.get(process.env.MIX_API_URL+'/api/get_bulk_count', {
      params: {
        place_id: localStorage.getItem('place_id'),
        type: recipientType
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setRecipientCount(response.data.phones_count)
    }).catch(error => {
      eventBus.dispatch("notification", {type: 'error', message: error.message});
    })
  }

  const sendMessage = (e) => {
    e.preventDefault();
    axios.post(process.env.MIX_API_URL+'/api/send_bulk_sms', {
      place_id: localStorage.getItem('place_id'),
      type: recipientType,
      text: text
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'The message has been sent'});
    }).catch(error => {
      setTextError([])
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          if(key === 'text') setTextError(value)
        }
      }else if(error.response.status === 401){
        setTextError(['Authorization error'])
      } else {
        setTextError([error.message])
        console.log('Error', error)
      }
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'text') {
      setText(e.target.value)
      setCaretPosition(e.target.value.length)
    }
    if(e.target.name === 'recipientType') setRecipientType(e.target.value)
  }

  const changeText = (ev) => {
    let newText = text
    if (newText.length > 0 && caretPosition === null) {
      newText += ev.target.value
    } else {
      newText = newText.slice(0, caretPosition) + ev.target.value + newText.slice(caretPosition)
    }
    setText(newText)
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Send Bulk SMS')}</h2>
      </Stack>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-6 mt-3">
            <form onSubmit={sendMessage}>
              <div className="mb-3">
                <FormControl size="small" fullWidth>
                  <InputLabel id="label_recipientType">{t('Send to')}</InputLabel>
                  <Select label={t('Send to')} value={recipientType}
                          labelId="label_recipientType" id="recipientType" name="recipientType"
                          onChange={onChange}>
                    <MenuItem value="all_customers">{t('All customers')}</MenuItem>
                    <MenuItem value="admins_waiters">{t('Admins and Waiters')}</MenuItem>
                    <MenuItem value="admins">{t('Admins')}</MenuItem>
                    <MenuItem value="waiters">{t('Waiters')}</MenuItem>
                    <MenuItem value="todays_waitinglist_customers">{t('Todays waitinglist customers')}</MenuItem>
                    <MenuItem value="myself">{t('Myself')}</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="mb-3">
                <select className="mb-3" onChange={changeText}>
                  <option value="">Insert dynamic data</option>
                  {options.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>

                <TextField label={t('Message')} size="small" fullWidth
                           type="text" id="text" name="text" required
                           onChange={onChange} value={text}
                           multiline rows="3"
                           error={textError.length > 0}
                           helperText={
                             <>{textError.map(el => {return t(el)})}</>
                           }
                           onClick={ev => setCaretPosition(ev.target.selectionStart)}
                           />
                <div>{t('Recipients')}: {recipientCount}</div>
              </div>
              <Button variant="contained" type="submit">{t('Send message')}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
