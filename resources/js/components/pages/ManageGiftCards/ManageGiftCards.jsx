import { Button, CircularProgress, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import moment from 'moment';
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

  const columns = [
    { field: 'code', headerName: t('Code'), flex: 1 },
    { field: 'created_at', headerName: t('Created'), flex: 1, renderCell: (params) => moment(params.value).format('DD-MM-YYYY') },
    { field: 'expired_at', headerName: t('Expiration date'), flex: 1, renderCell: (params) => moment(params.value).format('DD-MM-YYYY') },
    { field: 'status', headerName: t('Status'), flex: 1 },
    { field: 'spend_amount', headerName: t('Used amount'), flex: 1 },
    { field: 'unused_amount', headerName: t('Unused amount'), flex: 1 },
  ];

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
      setCards(response.data.map(i => ({
        ...i,
        unused_amount: i.initial_amount - i.spend_amount
      })))
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
      {loading ?
        <div><CircularProgress /></div> :
        <div style={{ width: '100%', height: 'calc(100vh - 300px)' }}>
          <DataGrid
            rows={cards}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
          />
        </div>
      }
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
