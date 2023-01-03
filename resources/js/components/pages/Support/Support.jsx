import { Button, TextField } from '@mui/material'
import React from 'react'
import { useState } from 'react'
import {useTranslation} from "react-i18next";
import eventBus from "../../../eventBus";

const Support = () => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    axios.post(`${process.env.MIX_API_URL}/api/places/send_support`,{
      subject: subject,
      message: message,
      place_id: localStorage.getItem('place_id')
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setLoading(false)
      setSubject('')
      setMessage('')
      eventBus.dispatch("notification", {type: 'success', message: 'Message sent successfully'});
    }).catch(error => {})
  }

  return (
    <div className='pages__container'>
      <h2>{t('Support')}</h2>
      <form onSubmit={onSubmit}>
        <div className="mt-3 mb-3">
          <TextField label={t('Subject')} size="small" fullWidth
            type="text" id="subject" name="subject" required
            onChange={e => setSubject(e.target.value)} />
        </div>
        <div className="mt-3 mb-3">
          <TextField label={t('Message')} size="small" fullWidth
            type="text" id="message" name="message"
            multiline rows="3" required
            onChange={e => setMessage(e.target.value)} />
        </div>
        <Button variant="contained" type="submit" disabled={loading}>{t('Send')}</Button>
      </form>
    </div>
  )
}

export default Support
