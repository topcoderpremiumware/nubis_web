import { Button, TextField } from '@mui/material'
import React from 'react'
import { useState } from 'react'

const Support = () => {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const onSubmit = async (ev) => {
    ev.preventDefault()
    
    console.log('subject', subject)
    console.log('message', message)
  }

  return (
    <div className='pages__container'>
      <h2>Support</h2>
      <form onSubmit={onSubmit}>
        <div className="mt-3 mb-3">
          <TextField label={'Subject'} size="small" fullWidth
            type="text" id="subject" name="subject" required
            onChange={ev => setSubject(ev.target.value)} />
        </div>
        <div className="mt-3 mb-3">
          <TextField label={'Message'} size="small" fullWidth
            type="text" id="message" name="message"
            multiline rows="3" required
            onChange={ev => setMessage(ev.target.value)} />
        </div>
        <Button variant="contained" type="submit">Send</Button>
      </form>
    </div>
  )
}

export default Support