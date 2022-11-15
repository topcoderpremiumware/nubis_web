import React, {useEffect, useState} from "react";
import  './EmailTemplate.scss';
import { useTranslation } from 'react-i18next';
import {useParams} from "react-router-dom";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import eventBus from "../../../eventBus";
import {Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField} from "@mui/material";
import { useRef } from "react";

const options = [
  '#ADDRESS#',
  '#AREA_DAY#',
  '#BOOK_DAY#',
  '#BOOK_DAY_NAME#',
  '#BOOK_TIME#',
  '#BOOK_TIME_AMPM#',
  '#BOOK_HOUR#',
  '#BOOK_HOUR_END#',
  '#BOOK_ID#',
  '#BOOK_LENGTH#',
  '#BOOK_MIN#',
  '#BOOK_ENDTIME#',
  '#BOOK_ENDTIME_AMPM#',
  '#BOOK_MIN_END#',
  '#BOOK_MONTH#',
  '#BOOK_MONTH_NAME#',
  '#BOOK_YEAR#',
  '#BOOK_COMMENT#',
  '#CALENDAR_LINK#',
  '#CANCEL_LINK#',
  '#RECONFIRM_LINK#',
  '#CHECK_CREDIT_CARD_LINK#',
  '#CITY#',
  '#COMPANY#',
  '#CONTACT_PERSON#',
  '#CONTACT_PHONE#',
  '#CUSTOM_BOOK_LENGTH_NAME#',
  '#EMAIL#',
  '#FIRST_NAME#',
  '#LAST_NAME#',
  '#FULL_NAME#',
  '#MAP_LINK#',
  '#NUMBER_OF_GUESTS#',
  '#PAY_BOOKING_LINK#',
  '#PHONE#',
  '#RESTAURANT_ADDRESS#',
  '#RESTAURANT_CITY#',
  '#RESTAURANT_VAT#',
  '#RESTAURANT_COUNTRY#',
  '#RESTAURANT_EMAIL#',
  '#RESTAURANT_HOMEPAGE#',
  '#RESTAURANT_NAME#',
  '#RESTAURANT_PHONE#',
  '#RESTAURANT_PHOTO#',
  '#RESTAURANT_ZIPCODE#',
  '#ZIPCODE#',
  '#LANDING_PAGE#',
  '#MAX_PAX_PAGE#',
  '#CANCEL_BOOKING_PAGE#',
  '#ALTERNATIVE_RESTAURANTS_PAGE#',
  '#UNSUBSCRIBE_LINK#',
]

export default function EmailTemplate() {
  const { t } = useTranslation();
  let { purpose } = useParams();

  var pageTitle = purpose.split('-').map(w => {
    let a = w.split('');
    a[0] = a[0].toUpperCase();
    return a.join('');
  }).join(' ');

  const [active, setActive] = useState(1)
  const [language, setLanguage] = useState(localStorage.getItem('i18nextLng'))
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [subjectError, setSubjectError] = useState([])
  const [textError, setTextError] = useState([])

  const select = useRef()

  useEffect(() => {
    setActive(1)
    setSubject('')
    setText('')
    axios.get(process.env.APP_URL+'/api/message_tempates/email-'+purpose,{
      params: {
        place_id: localStorage.getItem('place_id'),
        language: language
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setActive(response.data.active)
      setSubject(response.data.subject)
      setText(response.data.text)
    }).catch(error => {})
  },[language,purpose])

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(process.env.APP_URL+'/api/message_tempates/email-'+purpose, {
      place_id: localStorage.getItem('place_id'),
      language: language,
      active: active,
      subject: subject,
      text: text
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Template saved successfully'});
    }).catch(error => {
      setSubjectError([])
      setTextError([])
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          if(key === 'subject') setSubjectError(value)
          if(key === 'text') setTextError(value)
        }
      }else if(error.response.status === 401){
        setSubjectError(['Authorization error'])
      } else {
        setSubjectError([error.message])
      console.log('Error', error)
      }
    })
  }

  const testMessage = (e) => {
    e.preventDefault();

  }

  const onChange = (e) => {
    if(e.target.name === 'language') setLanguage(e.target.value)
    if(e.target.name === 'active') setActive(e.target.checked)
    if(e.target.name === 'text') setText(e.target.value)
    if(e.target.name === 'subject') setSubject(e.target.value)
    if(e.target.name === 'email') setTestEmail(e.target.value)
  }

  return (
    <div className='pages__container'>
      <h2>{t('Email Templates')} - {t(pageTitle)}</h2>
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
                <TextField label={t('Subject')} size="small" fullWidth
                           type="text" id="subject" name="subject" required
                           onChange={onChange} value={subject}
                           error={subjectError.length > 0}
                           helperText={
                             <>{subjectError.map(el => {return t(el)})}</>
                           }/>
              </div>
              <div className="mb-3">
                <label htmlFor="text" className="d-flex justify-content-between form-label">
                  {t('Message')}
                  <select ref={select}>
                    <option value="">Insert dynamic data</option>
                    {options.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </label>
                <CKEditor
                  className={`${textError.length > 0 ? 'is-invalid' : ''}`}
                  editor={ClassicEditor}
                  data={text}
                  onChange={(event, editor) => onChange({target: {name: 'text', value: editor.getData()}})}
                  onReady={(editor) => {
                    select.current.addEventListener('change', (ev) => {
                      editor.model.change(writer => {
                        const insertPosition = editor.model.document.selection.getFirstPosition();
                        writer.insertText(ev.target.value, insertPosition);
                      });
                    })
                  }}
                />
                {textError.length > 0 &&
                  <>{textError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                }
              </div>
              <Button variant="contained" type="submit">{t('Save template')}</Button>
            </form>
          </div>
          <div className="col-lg-6 mt-3">
            <h4>{t('Preview')}</h4>
            <hr/>
            <form onSubmit={testMessage}>
              <div className="mb-3">
                <TextField label={t('Send Email to')} size="small" fullWidth
                           type="text" id="email" name="email" required
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
