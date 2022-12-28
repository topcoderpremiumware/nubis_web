import { Box, Button } from '@mui/material';
import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BookingLinkGuide = () => {
  const { t } = useTranslation();

  const [place, setPlace] = useState({})
  const [cards, setCards] = useState([])

  const getPlace = () => {
    axios.get(`${process.env.APP_URL}/api/places/${localStorage.getItem('place_id')}`).then(response => {
      setPlace(response.data)
    }).catch(error => {
    })
  }

  const getCards = async () => {
    await axios.get(`${process.env.APP_URL}/api/giftcards`, {
      params: {
        place_id: localStorage.getItem('place_id')
      }
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setCards(response.data)
    }).catch(error => {
    })
  }

  useEffect(() => {
    getPlace()
    getCards()
  }, [])

  return (
    <div className='pages__container'>
      <h2>Booking Link Guide</h2>
      <div className='mt-3'>
        <h4>Home page:</h4>
        <Box sx={{display: 'flex', gap: '40px'}}>
          <a href={place.home_page} target="_blank">{place.home_page}</a>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => window.navigator.clipboard.writeText(place.home_page)}
          >Copy to clipboard</Button>
        </Box>
      </div>
      <div className='mt-3'>
        <h4>Gift cards:</h4>
        {cards.map(i => (
          <Box sx={{display: 'flex', gap: '40px'}}>
            <a href={i?.url} target="_blank">{i?.url}</a>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.navigator.clipboard.writeText(i?.url)}
            >Copy to clipboard</Button>
          </Box>
        ))}
      </div>
    </div>
  )
}

export default BookingLinkGuide