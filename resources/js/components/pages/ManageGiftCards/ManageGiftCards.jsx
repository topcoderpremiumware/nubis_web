import { Button, CircularProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, styled } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import CheckGiftCardPopup from './CheckGiftCardPopup/CheckGiftCardPopup';
import NewGiftCardPopup from './NewGiftCardPopup/NewGiftCardPopup';

const ManageGiftCards = () => {
  const { t } = useTranslation();

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPopupIsOpen, setNewPopupIsOpen] = useState(false)
  const [checkPopupIsOpen, setCheckPopupIsOpen] = useState(false)

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const getCards = async () => {
    setLoading(true)
    await axios.get(`${process.env.MIX_API_URL}/api/giftcards`, {
      params: {
        place_id: localStorage.getItem('place_id')
      }
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setCards(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  useEffect(() => {
    getCards()
    eventBus.on("placeChanged", () => {
      getCards()
    })
    eventBus.on("newGiftCard", () => {
      getCards()
    })
    eventBus.on("spendGiftCard", () => {
      getCards()
    })
  }, [])

  return (
    <div className='pages__container'>
      <h2>{t('Manage Gift Cards')}</h2>
      <div className="container-fluid">
        <div className="row">
          {loading ? <div><CircularProgress /></div> : <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small">{t('Code')}</TableCell>
                  <TableCell size="small">{t('Initial Amount')}</TableCell>
                  <TableCell size="small">{t('Spend Amount')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cards.map((item, key) => {
                  return <StyledTableRow key={key}>
                    <TableCell size="small">{item.code}</TableCell>
                    <TableCell size="small">{item.initial_amount} DKK</TableCell>
                    <TableCell size="small">{item.spend_amount} DKK</TableCell>
                  </StyledTableRow>
                })}
              </TableBody>
            </Table>
          </TableContainer>}
        </div>
      </div>
      <Stack spacing={2} sx={{ mt: 2 }} direction="row">
        <Button 
          variant="contained" 
          type="button" 
          onClick={() => setNewPopupIsOpen(true)}
        >{t('New')}</Button>
        <Button 
          variant="contained" 
          type="button" 
          onClick={() => setCheckPopupIsOpen(true)}
        >{t('Check')}</Button>
      </Stack>

      <NewGiftCardPopup
        open={newPopupIsOpen}
        handleClose={() => setNewPopupIsOpen(false)}
      />

      <CheckGiftCardPopup
        open={checkPopupIsOpen}
        handleClose={() => setCheckPopupIsOpen(false)}
      />
    </div>
  )
}

export default ManageGiftCards
