import { Button, CircularProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, styled } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";

const ManageGiftCards = () => {
  const { t } = useTranslation();

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

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
  }, [])

  return (
    <div className='pages__container'>
      <h2>Manage Gift Cards</h2>
      <div className="container-fluid">
        <div className="row">
          {loading ? <div><CircularProgress /></div> : <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small">{t('Code')}</TableCell>
                  <TableCell size="small">{t('Initial Amount')}</TableCell>
                  <TableCell size="small">{t('Spend Amount')}</TableCell>
                  {/* <TableCell size="small" style={{ minWidth: '100px' }}>{t('Actions')}</TableCell> */}
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
        <Button variant="contained" type="button" onClick={e => {
          // openEditPopup(false)
        }}>{t('New')}</Button>
      </Stack>
    </div>
  )
}

export default ManageGiftCards
