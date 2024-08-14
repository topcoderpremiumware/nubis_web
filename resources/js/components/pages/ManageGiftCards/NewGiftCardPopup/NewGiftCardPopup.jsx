// import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import './NewGiftCardPopup.scss';

import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import eventBus from '../../../../eventBus';
import { useTranslation } from 'react-i18next';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  height: '87%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function NewGiftCardPopup({ open, handleClose }) {
  const { t } = useTranslation();

  const [count, setCount] = useState(1)
  const [amount, setAmount] = useState(100)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [receiverEmail, setReceiverEmail] = useState('')
  const [isReceiver, setIsReceiver] = useState(false)
  const [error, setError] = useState('')

  const onClose = () => {
    setCount(1)
    setAmount(100)
    setName('')
    setEmail('')
    setReceiverName('')
    setReceiverEmail('')
    setIsReceiver(false)
    setError('')
    handleClose()
  }

  const onCreate = async () => {
    try {
      const data = {
        place_id: localStorage.getItem('place_id'),
        quantity: count,
        name,
        email,
        initial_amount: amount,
        expired_at: '2037-12-31 22:00:00',
        ...(isReceiver && {
          receiver_name: receiverName,
          receiver_email: receiverEmail
        })
      }

      await axios.post(process.env.MIX_API_URL + '/api/giftcards_admin', data, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })

      eventBus.dispatch("newGiftCard")
      onClose()
    } catch (err) {
      setError(err.response.data.message)
    }
  }

  return (
    <div>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className='NewGiftCardPopup__container'>
          <div className='close-icon' onClick={onClose}><CloseIcon /></div>
          <h3>{t('Create new gift card')}</h3>
          <div className="row mt-4">
            <div className="col-md-6">
              <TextField label={t('Count')} size="small" fullWidth sx={{ mb: 2 }}
                type="number" id="count" name="count"
                InputProps={{ inputProps: { min: 1, max: 100 } }}
                value={count}
                onChange={ev => setCount(ev.target.value)} />
            </div>
            <div className="col-md-6">
              <TextField label={t('Amount')} size="small" fullWidth sx={{ mb: 2 }}
                type="number" id="amount" name="amount"
                InputProps={{ inputProps: { min: 100, max: 10000 } }}
                value={amount}
                onChange={ev => setAmount(ev.target.value)} />
            </div>
          </div>
          <FormControlLabel
            control={
              <Checkbox
                color="default"
                size="small"
                checked={isReceiver}
                onChange={ev => setIsReceiver(ev.target.checked)}
              />
            }
            label={t("Send to RECEIVERS e-mail")}
          />
          <div className="row mt-3 mb-3">
            <div className="col-md-6">
              <TextField label={t('Name')} size="small" fullWidth sx={{ mb: 2 }}
                type="text" id="name" name="name"
                value={name}
                onChange={ev => setName(ev.target.value)} />
              <TextField label={t('Email')} size="small" fullWidth sx={{ mb: 2 }}
                type="email" id="email" name="email"
                value={email}
                onChange={ev => setEmail(ev.target.value)} />
            </div>
            {isReceiver && (
              <div className="col-md-6">
                <TextField label={t('Receiver Name')} size="small" fullWidth sx={{ mb: 2 }}
                  type="text" id="receiver_name" name="receiver_name"
                  value={receiverName}
                  onChange={ev => setReceiverName(ev.target.value)} />
                <TextField label={t('Receiver Email')} size="small" fullWidth sx={{ mb: 2 }}
                  type="email" id="receiver_email" name="receiver_email"
                  value={receiverEmail}
                  onChange={ev => setReceiverEmail(ev.target.value)} />
              </div>
            )}
          </div>

          {error && <p className='error'>{error}</p>}

          <Button
            variant="contained"
            type="button"
            onClick={onCreate}
          >{t('Create')}</Button>
        </Box>
      </Modal>
    </div>
  );
}
