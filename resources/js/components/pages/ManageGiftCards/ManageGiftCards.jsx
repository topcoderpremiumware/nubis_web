import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import {
  DataGrid,
  GridFooterContainer,
  GridPagination,
  GridSeparatorIcon
} from '@mui/x-data-grid';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import CheckGiftCardPopup from './CheckGiftCardPopup/CheckGiftCardPopup';
import NewGiftCardPopup from './NewGiftCardPopup/NewGiftCardPopup';
import {IconButton} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";

const ManageGiftCards = () => {
  const { t } = useTranslation();

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPopupIsOpen, setNewPopupIsOpen] = useState(false)
  const [checkPopupIsOpen, setCheckPopupIsOpen] = useState(false)
  const [usedTotal, setUsedTotal] = useState(0)
  const [unusedTotal, setUnusedTotal] = useState(0)

  const columns = [
    { field: 'code', headerName: t('Code'), flex: 1 },
    { field: 'giftcard_menu', headerName: t('Experience'), minWidth: 200, flex: 1, renderCell: (params) => params.value?.name },
    { field: 'created_at', headerName: t('Created'), flex: 1, renderCell: (params) => moment.utc(params.value).local().format('DD-MM-YYYY') },
    { field: 'expired_at', headerName: t('Expiration date'), flex: 1, renderCell: (params) => moment.utc(params.value).format('DD-MM-YYYY') },
    { field: 'status', headerName: t('Status'), flex: 1 },
    { field: 'spend_amount', headerName: t('Used amount'), flex: 1 },
    { field: 'unused_amount', headerName: t('Unused amount'), flex: 1 },
    { field: 'url', headerName: t('File'), flex: 1, renderCell: (params) =>
        <span>
          {params.value && <IconButton onClick={() => window.open(params.value, '_blank').focus()} size="small">
            <ReceiptIcon fontSize="small"/>
          </IconButton>}
        </span>, },
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
      let tempUsedTotal = 0
      let tempUnusedTotal = 0
      setCards(response.data.map(i => {
        tempUsedTotal += i.spend_amount
        tempUnusedTotal += i.initial_amount - i.spend_amount
        return {...i, unused_amount: i.initial_amount - i.spend_amount}
      }))
      setUsedTotal(tempUsedTotal)
      setUnusedTotal(tempUnusedTotal)
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

  const CustomGridFooter = () => {
    return (
      <GridFooterContainer>
        <div className="datagrid_footer_info">
          {t('Used amount')}: {usedTotal}
          <GridSeparatorIcon />
          {t('Unused amount')}: {unusedTotal}
          <GridSeparatorIcon />
        </div>
        <GridPagination />
      </GridFooterContainer>
    );
  }

  const doubleClickHandler = (params, event, details) => {
    setCheckPopupIsOpen(true)
    eventBus.dispatch('openCheckGiftCardPopup',{code: params.row.code})
  }

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
            components={{Footer: CustomGridFooter}}
            onRowDoubleClick={doubleClickHandler}
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
