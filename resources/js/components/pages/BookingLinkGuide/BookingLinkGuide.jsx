import { Box, Button, Stack } from '@mui/material';
import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import {isBills} from "../../../helper";

const BookingLinkGuide = () => {
  const { t } = useTranslation();

  const [place, setPlace] = useState({})

  const getPlace = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}`).then(response => {
      setPlace(response.data)
    }).catch(error => {
    })
  }

  const getGiftCardUrl = () => {
    return `${process.env.MIX_APP_URL}/giftcard/${localStorage.getItem('place_id')}`
  }

  const getFeedbacksUrl = () => {
    return `${process.env.MIX_APP_URL}/feedbacks/${localStorage.getItem('place_id')}`
  }

  const getBookUrl = () => {
    return `${process.env.MIX_APP_URL}/book/${localStorage.getItem('place_id')}`
  }

  useEffect(() => {
    getPlace()
    eventBus.on("placeChanged",  () => {
      getPlace()
    })
  }, [])

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Booking Link Guide')}</h2>
      </Stack>
      <div className='mt-3'>
        <h4>{t('Home page')}:</h4>
        <Box sx={{display: 'flex', gap: '40px'}}>
          <a href={place.home_page} target="_blank">{place.home_page}</a>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.navigator.clipboard.writeText(place.home_page)}
          >{t('Copy to clipboard')}</Button>
        </Box>
      </div>
      {isBills(['full','giftcards']) && <div className='mt-3'>
        <h4>{t('Gift cards')}:</h4>
        <Box sx={{display: 'flex', gap: '40px'}}>
          <a href={getGiftCardUrl()} target="_blank">{getGiftCardUrl()}</a>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.navigator.clipboard.writeText(getGiftCardUrl())}
          >{t('Copy to clipboard')}</Button>
        </Box>
      </div>}
      {isBills(['full','booking']) && <><div className='mt-3'>
        <h4>{t('Booking page')}:</h4>
        <Box sx={{display: 'flex', gap: '40px'}}>
          <a href={getBookUrl()} target="_blank">{getBookUrl()}</a>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.navigator.clipboard.writeText(getBookUrl())}
          >{t('Copy to clipboard')}</Button>
        </Box>
      </div>
      <div className='mt-3'>
        <h4>{t('Feedbacks page')}:</h4>
        <Box sx={{display: 'flex', gap: '40px'}}>
          <a href={getFeedbacksUrl()} target="_blank">{getFeedbacksUrl()}</a>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.navigator.clipboard.writeText(getFeedbacksUrl())}
          >{t('Copy to clipboard')}</Button>
        </Box>
      </div></>}
    </div>
  )
}

export default BookingLinkGuide
