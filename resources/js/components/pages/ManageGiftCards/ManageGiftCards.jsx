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
import DeleteIcon from "@mui/icons-material/Delete";

const ManageGiftCards = () => {
  const { t } = useTranslation();

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPopupIsOpen, setNewPopupIsOpen] = useState(false)
  const [checkPopupIsOpen, setCheckPopupIsOpen] = useState(false)
  const [usedTotal, setUsedTotal] = useState(0)
  const [unusedTotal, setUnusedTotal] = useState(0)

  const columns = () => {
    let out = []

    out.push({ field: 'code', headerName: t('Code'), width: 110 })
    out.push({ field: 'giftcard_menu', headerName: t('Experience'), width: 200, renderCell: (params) => params.value?.name })
    out.push({ field: 'created_at', headerName: t('Created'), width: 110, renderCell: (params) => moment.utc(params.value).local().format('DD-MM-YYYY') })
    out.push({ field: 'expired_at', headerName: t('Expiration date'), width: 110, renderCell: (params) => moment.utc(params.value).format('DD-MM-YYYY') })
    if(window.role === 'admin') {
      out.push({field: 'deleted_at', headerName: t('Deleted'), width: 110, renderCell: (params) => params.value ? moment.utc(params.value).format('DD-MM-YYYY') : ''})
      out.push({field: 'delete_comment', headerName: t('Deleted comment'), width: 200})
    }
    out.push({ field: 'status', headerName: t('Status'), width: 100 })
    out.push({ field: 'spend_amount', headerName: t('Used amount'), width: 100 })
    out.push({ field: 'unused_amount', headerName: t('Unused amount'), width: 100 })
    out.push({ field: 'url', headerName: t('File'), width: 50, renderCell: (params) =>
            <span>
          {params.value && <IconButton onClick={() => window.open(params.value, '_blank').focus()} size="small">
            <ReceiptIcon fontSize="small"/>
          </IconButton>}
        </span>, })
    out.push({ field: 'actions', headerName: t('Actions'), width: 100, renderCell: (params) =>
            <span>
          {window.role === 'admin' && <IconButton onClick={() => deleteGiftcard(params.id)} size="small">
            <DeleteIcon fontSize="small"/>
          </IconButton>}
        </span>, type: 'actions', })

    return out
  }

  const getCards = async () => {
    setLoading(true)
    await axios.get(`${process.env.MIX_API_URL}/api/giftcards?deleted=1`, {
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
        if(!i.deleted_at){
          tempUsedTotal += i.spend_amount
          tempUnusedTotal += i.initial_amount - i.spend_amount
        }
        return {...i, unused_amount: i.initial_amount - i.spend_amount}
      }))
      setUsedTotal(tempUsedTotal)
      setUnusedTotal(tempUnusedTotal)
      setLoading(false)
    }).catch(error => {
    })
  }

  const deleteGiftcard = (id) => {
    let comment = window.prompt(t('Are you sure you want to delete this giftcard? Write why:'))
    if (comment) {
      axios.delete(`${process.env.MIX_API_URL}/api/giftcards/${id}?delete_comment=${comment}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        getCards()
        eventBus.dispatch("notification", {type: 'success', message: 'Giftcard deleted successfully'});
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
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
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Manage Gift Cards')}</h2>
      </Stack>
      {loading ?
        <div><CircularProgress /></div> :
        <div style={{ width: '100%', height: 'calc(100vh - 300px)' }}>
          <DataGrid
            rows={cards}
            columns={columns()}
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
