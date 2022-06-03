import React, {useEffect, useState} from "react";
import  './EmailTemplate.scss';
import { useTranslation } from 'react-i18next';
import {useParams} from "react-router-dom";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Switch from "react-switch";
import eventBus from "../../../eventBus";

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
    if(e.target.name === 'active') setActive(e.target.value)
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
                <label htmlFor="language" className="form-label">{t('Language')}</label>
                <select onChange={onChange} id="language" name="language" className="form-select">
                  {window.langs.map((lang,key) => {
                    return <option key={key} value={lang.lang}>{lang.title}</option>
                  })}
                </select>
              </div>
              <div className="mb-3 d-flex">
                <label className="form-label">{t('Template is active')}</label>
                <Switch
                  className="checkbox_switch ms-3"
                  onChange={(event) => onChange({target: {name: 'active', value: event}})}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={24}
                  width={60}
                  handleDiameter={16}
                  boxShadow={'0px 1px 3px #00000099'}
                  activeBoxShadow={'0px 1px 3px #00000099'}
                  offColor="#acacac"
                  onColor={'#343C48'}
                  offHandleColor="#acacac"
                  onHandleColor={'#ffffff'}
                  checked={Boolean(active)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">{t('Subject')}</label>
                <input onChange={onChange} required type="text" value={subject}
                       className={`form-control ${subjectError.length > 0 ? 'is-invalid' : ''}`}
                       name="subject" id="subject"/>
                {subjectError.length > 0 &&
                  <>{subjectError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                }
              </div>
              <div className="mb-3">
                <label htmlFor="text" className="form-label">{t('Message')}</label>
                <CKEditor
                  className={`${textError.length > 0 ? 'is-invalid' : ''}`}
                  editor={ClassicEditor}
                  data={text}
                  onChange={(event, editor) => onChange({target: {name: 'text', value: editor.getData()}})}
                  // onReady={(editor) => {
                  //   editor.plugins.get('FileRepository')
                  //     .createUploadAdapter = (loader) => {
                  //     return new UploadAdapter(loader)
                  //   }
                  // }}
                />
                {textError.length > 0 &&
                  <>{textError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                }
              </div>
              <button type="submit" className="btn btn-primary">{t('Save template')}</button>
            </form>
          </div>
          <div className="col-lg-6 mt-3">
            <h4>{t('Preview')}</h4>
            <hr/>
            <form onSubmit={testMessage}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">{t('Send Email to')}</label>
                <input onChange={onChange} required type="email"
                       className={`form-control`}
                       name="email" id="email"/>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('Message')}</label>
                <div dangerouslySetInnerHTML={{__html: text}} />
              </div>
              <button type="submit" className="btn btn-primary">{t('Send test')}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
