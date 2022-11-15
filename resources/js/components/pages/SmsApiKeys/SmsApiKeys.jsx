import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material';

const SmsApiKeys = () => {
  const { t } = useTranslation();

  const [key, setKey] = useState('')
  const [secret, setSecret] = useState('')
  const [token, setToken] = useState('')

  const onChange = (e) => {
    if (e.target.name === 'key') setKey(e.target.value)
    if (e.target.name === 'secret') setSecret(e.target.checked)
    if (e.target.name === 'token') setToken(e.target.value)
  }

  const onSubmit = (e) => {
    e.preventDefault();
  }

  useEffect(() => {
    // get users data
  }, [])

  return (
    <div className='pages__container'>
      <h2>{t('SMS Templates')} - {t('API Keys')}</h2>
      <div className="container-fluid">
        <div className="row">
          <div className="mt-3">
            <div className="mb-3">
              <a href="https://gatewayapi.com/docs/apis/rest/" target="_blank">{t('Get API keys')}</a>
            </div>
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <TextField label={t('Key')} size="small" fullWidth
                  type="text" id="key" name="key" required
                  value={key} onChange={onChange} 
                />
              </div>
              <div className="mb-3">
                <TextField label={t('Secret')} size="small" fullWidth
                  type="text" id="secret" name="secret" required
                  value={secret} onChange={onChange} 
                />
              </div>
              <div className="mb-3">
                <TextField label={t('Token')} size="small" fullWidth
                  type="text" id="token" name="token" required
                  value={token} onChange={onChange} 
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

export default SmsApiKeys