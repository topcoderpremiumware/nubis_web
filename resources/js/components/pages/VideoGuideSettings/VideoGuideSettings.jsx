import { Button, MenuItem, Select, TextField } from '@mui/material';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';

const VideoGuideSettings = () => {
  const { t } = useTranslation();

  const [lang, setLang] = useState('en')
  const [sms, setSms] = useState('')
  const [stripe, setStripe] = useState('')

  const onSubmit = async (ev) => {
    ev.preventDefault()

  }

  return (
    <div className='pages__container'>
      <h2>{t('Video Guide Settings')}</h2>
      <div className="container-fluid">
        <div className="row">
          <div className="mt-3">
            <form onSubmit={onSubmit}>
              <div className="d-flex align-items-center mb-3 gap-2">
                <h5>{t('Language')}:</h5>
                <Select value={lang}
                  size="small"
                  onChange={setLang}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="dk">Dansk</MenuItem>
                </Select>
              </div>
              <div className="mb-3">
                <TextField label={`SMS ${t('Setup')}`} size="small" fullWidth
                  type="text" required
                  value={sms} onChange={ev => setSms(ev.target.value)}
                />
              </div>
              <div className="mb-3">
                <TextField label={`Stripe ${t('Setup')}`} size="small" fullWidth
                  type="text" required
                  value={stripe} onChange={ev => setStripe(ev.target.value)}
                />
              </div>
              <Button variant="contained" type="submit">{t('Save')}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>

  )
}

export default VideoGuideSettings