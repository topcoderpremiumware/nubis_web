import React, {useEffect, useState} from "react";
import  './SmsTemplate.scss';
import { useTranslation } from 'react-i18next';
import {useNavigate, useParams} from "react-router-dom";
import eventBus from "../../../eventBus";
import {Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Switch, TextField} from "@mui/material";

const options = [
  "#ADDRESS#",
  "#AREA_NAME#",
  "#BOOK_DAY#",
  "#BOOK_DAY_NAME#",
  "#BOOK_TIME#",
  "#BOOK_TIME_AMPM#",
  "#BOOK_HOUR#",
  "#BOOK_HOUR_END#",
  "#BOOK_ID#",
  "#BOOK_LENGTH#",
  "#BOOK_MIN#",
  "#BOOK_ENDTIME#",
  "#BOOK_ENDTIME_AMPM#",
  "#BOOK_MIN_END#",
  "#BOOK_MONTH#",
  "#BOOK_MONTH_NAME#",
  "#BOOK_YEAR#",
  "#BOOK_COMMENT#",
  "#CALENDAR_LINK#",
  "#CANCEL_LINK#",
  "#RECONFIRM_LINK#",
  "#CHECK_CREDIT_CARD_LINK#",
  "#CITY#",
  "#COMPANY#",
  "#CONTACT_PERSON#",
  "#CONTACT_PHONE#",
  "#CUSTOM_BOOK_LENGTH_NAME#",
  "#EMAIL#",
  "#FIRST_NAME#",
  "#LAST_NAME#",
  "#FULL_NAME#",
  "#MAP_LINK#",
  "#NUMBER_OF_GUESTS#",
  "#PAY_BOOKING_LINK#",
  "#PHONE#",
  "#RESTAURANT_ADDRESS#",
  "#RESTAURANT_CITY#",
  "#RESTAURANT_VAT#",
  "#RESTAURANT_COUNTRY#",
  "#RESTAURANT_EMAIL#",
  "#RESTAURANT_HOMEPAGE#",
  "#RESTAURANT_NAME#",
  "#RESTAURANT_PHONE#",
  "#RESTAURANT_PHOTO#",
  "#RESTAURANT_ZIPCODE#",
  "#ZIPCODE#",
  "#LANDING_PAGE#",
  "#MAX_PAX_PAGE#",
  "#CANCEL_BOOKING_PAGE#",
  "#ALTERNATIVE_RESTAURANTS_PAGE#",
  "#UNSUBSCRIBE_LINK#",
  "#FEEDBACK_LINK#"
]
export default function SmsTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  let { purpose } = useParams();

  var pageTitle = purpose.split('-').map(w => {
    let a = w.split('');
    a[0] = a[0].toUpperCase();
    return a.join('');
  }).join(' ');

  const [active, setActive] = useState(1)
  const [language, setLanguage] = useState(localStorage.getItem('i18nextLng'))
  const [text, setText] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [textError, setTextError] = useState([])
  const [caretPosition, setCaretPosition] = useState(null)

  useEffect(() => {
    eventBus.on("placeChanged",  () => {
      getTemplate()
    })
  },[])

  useEffect(() => {
    getTemplate()
  },[language,purpose])

  const getTemplate = () => {
    setActive(1)
    setText('')
    axios.get(process.env.MIX_API_URL+'/api/message_tempates/sms-'+purpose,{
      params: {
        place_id: localStorage.getItem('place_id'),
        language: language
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setActive(response.data.active)
      setText(response.data.text)
    }).catch(error => {})
  }

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(process.env.MIX_API_URL+'/api/message_tempates/sms-'+purpose, {
      place_id: localStorage.getItem('place_id'),
      language: language,
      active: active,
      text: text
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Template saved successfully'});
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

  const testMessage = (e) => {
    e.preventDefault();
    axios.post(process.env.MIX_API_URL+'/api/message_tempates_test_sms', {
      place_id: localStorage.getItem('place_id'),
      phone: testPhone,
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
    if(e.target.name === 'language') setLanguage(e.target.value)
    if(e.target.name === 'active') setActive(e.target.checked)
    if(e.target.name === 'text') {
      setText(e.target.value)
      setCaretPosition(e.target.value.length)
    }
    if(e.target.name === 'phone') setTestPhone(e.target.value)
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
        <h2>{t('SMS Templates')} - {t(pageTitle)}</h2>
        <Button
          variant="contained"
          size="sm"
          type="button"
          onClick={() => navigate('/VideoGuides')}
        >{t('See Table Booking POS Academy')}</Button>
      </Stack>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-6 mt-3">
            <h4>{t('Template')}</h4>
            <hr/>
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <FormControl size="small" fullWidth>
                  <InputLabel id="label_language">{t('Language')}</InputLabel>
                  <Select label={t('Language')} value={language}
                          labelId="label_language" id="language" name="language"
                          onChange={onChange}>
                    {window.langs.map((lang,key) => {
                      return <MenuItem key={key} value={lang.lang}>{lang.title}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              </div>
              <div className="mb-3">
                <FormControlLabel label={t('Template is active')} labelPlacement="start"
                                  control={
                                    <Switch onChange={onChange}
                                            name="active"
                                            checked={Boolean(active)} />
                                  }/>
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
                           multiline rows="6"
                           error={textError.length > 0}
                           helperText={
                             <>{textError.map(el => {return t(el)})}</>
                           }
                           onClick={ev => setCaretPosition(ev.target.selectionStart)}
                           />
              </div>
              <Button variant="contained" type="submit">{t('Save template')}</Button>
            </form>
          </div>
          <div className="col-lg-6 mt-3">
            <h4>{t('Preview')}</h4>
            <hr/>
            <form onSubmit={testMessage}>
              <div className="mb-3">
                <TextField label={t('Send SMS to')} size="small" fullWidth
                           type="text" id="phone" name="phone" required
                           onChange={onChange}/>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('Message')}</label>
                <div dangerouslySetInnerHTML={{__html: text}} />
              </div>
              <Button variant="contained" type="submit">{t('Send test')}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
