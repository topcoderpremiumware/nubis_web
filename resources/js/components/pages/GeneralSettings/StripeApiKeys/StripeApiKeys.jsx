import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material';

const StripeApiKeys = () => {
  const { t } = useTranslation();

  const [cKey, setCKey] = useState('')
  const [pKey, setPKey] = useState('')

  const onChange = (e) => {
    if (e.target.name === 'cKey') setCKey(e.target.value)
    if (e.target.name === 'pKey') setPKey(e.target.value)
  }

  const onSubmit = (e) => {
    e.preventDefault();
  }

  useEffect(() => {
    // get users data
  }, [])

  return (
    <div className='pages__container'>
      <h2>{t('Stripe Keys')}</h2>
      <div className="container-fluid">
        <div className="row">
          <div className="mt-3">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <TextField label={t('C Key')} size="small" fullWidth
                  type="text" id="cKey" name="cKey" required
                  value={cKey} onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <TextField label={t('P Key')} size="small" fullWidth
                  type="text" id="pKey" name="pKey" required
                  value={pKey} onChange={onChange}
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

export default StripeApiKeys