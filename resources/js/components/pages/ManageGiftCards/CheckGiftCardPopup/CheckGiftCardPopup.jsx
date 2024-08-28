import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import './CheckGiftCardPopup.scss';

import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {useEffect, useState} from 'react';
import axios from 'axios';
import eventBus from '../../../../eventBus';

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

export default function CheckGiftCardPopup({ open, handleClose }) {
  const { t } = useTranslation();

  const [code, setCode] = useState('')
  const [cardInfo, setCardInfo] = useState(null)
  const [amount, setAmount] = useState(1)
  const [error, setError] = useState('')
  const [currency, setCurrency] = useState('DDK')
  const [autoOpen, setAutoOpen] = useState(false)

  useEffect(() => {
    getCurrency()
    eventBus.on("placeChanged", () => {
      getCurrency()
    })
    eventBus.on('openCheckGiftCardPopup',(data) => {
      setCode(data.code)
      setAutoOpen(true)
    })
  },[])

  useEffect(() => {
    if(autoOpen && code) checkCard()
  },[code])

  const onClose = () => {
    setCode('')
    setCardInfo(null)
    setAmount(1)
    setError('')
    handleClose()
  }

  const checkCard = async () => {
    try {
      setCardInfo(null)

      const response = await axios.get(process.env.MIX_API_URL + '/api/giftcards_check', {
        params: {
          code: code,
          place_id: localStorage.getItem('place_id')
        },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })

      setCardInfo(response.data)
      setError('')
    } catch (err) {
      setError(err.response.data.message)
    }
  }

  const getCurrency = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'online-payment-currency'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setCurrency(response.data.value)
    }).catch(error => {
      setCurrency('')
    })
  }

  const onSpend = async () => {
    try {
      await axios.post(process.env.MIX_API_URL + '/api/giftcards_spend', {
        code,
        amount
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })

      eventBus.dispatch("spendGiftCard")
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
        <Box sx={style} className='CheckGiftCardPopup__container'>
          <div className='close-icon' onClick={onClose}><CloseIcon /></div>
          <h3>{t('Check gift card')}</h3>
          <div className="row mt-4">
            <div className="col-md-6">
              <TextField label={t('Code')} size="small" fullWidth sx={{ mb: 2 }}
                type="text" id="code" name="code"
                value={code}
                onChange={ev => setCode(ev.target.value)} />
            </div>
            <div className="col-md-6">
              <Button
                variant="contained"
                type="button"
                onClick={checkCard}
              >{t('Check')}</Button>
            </div>
          </div>

          {cardInfo && <>
            <div className="row">
              <div className="col-md-6">
                <p><b>{t('Name')}:</b> {cardInfo.name || '-'}</p>
                <p><b>{t('Email')}:</b> {cardInfo.email || '-'}</p>
                <p><b>{t('Initail Amount')}:</b> {cardInfo.initial_amount} {currency}</p>
                {cardInfo.giftcard_menu_id && <>
                  <p><b>{t('Experience')}:</b> {cardInfo.giftcard_menu.name}</p>
                </>}
              </div>
              <div className="col-md-6">
                <p><b>{t('Receiver Name')}:</b> {cardInfo.receiver_name || '-'}</p>
                <p><b>{t('Receiver Email')}:</b> {cardInfo.receiver_email || '-'}</p>
                <p><b>{t('Spend Amount')}:</b> {cardInfo.spend_amount} {currency}</p>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <TextField label={t('Amount')} size="small" fullWidth sx={{ mb: 2 }}
                  type="number" id="amount" name="amount"
                  InputProps={{ inputProps: { min: 1, max: 10000 } }}
                  value={amount}
                  onChange={ev => setAmount(ev.target.value)} />
              </div>
              <div className="col-md-6">
                <Button
                  variant="contained"
                  type="button"
                  onClick={onSpend}
                >{t('Spend')}</Button>
              </div>
            </div>
          </>}

          {error && <p className='error'>{error}</p>}
        </Box>
      </Modal>
    </div>
  );
}
