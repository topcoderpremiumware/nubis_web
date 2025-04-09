import React, {useEffect, useState} from "react";
import  './BillingReport.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import {
  CircularProgress,
  IconButton,
  Stack, Tooltip,
} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import Moment from "moment";
import {DataGrid} from "@mui/x-data-grid";
import {simpleCatchError} from "../../../helper";
import EditIcon from "@mui/icons-material/Edit";

export default function BillingReport() {
  const {t} = useTranslation();

  const [billings, setBillings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect( () => {
    getData()
    function placeChanged(){
      getData()
    }
    eventBus.on("placeChanged", placeChanged)
    return () => {
      eventBus.remove("placeChanged", placeChanged)
    }
  }, [])

  const columns = [
    { field: 'payment_date', headerName: t('Date'), minWidth: 200, flex: 1 },
    { field: 'expired_at', headerName: t('Expired'), minWidth: 200, flex: 1 },
    { field: 'product_name', headerName: t('Name'), minWidth: 100, flex: 1 },
    { field: 'amount', headerName: t('Amount'), width: 100 },
    { field: 'currency', headerName: t('Currency'), width: 100 },
    { field: 'payment_intent_id', headerName: t('Id'), minWidth: 250, flex: 1 },
    { field: 'receipt_url', headerName: t('Receipt'), width: 100, renderCell: (params) =>
        <span>
          {params.value && <IconButton onClick={() => window.open(params.value, '_blank').focus()} size="small">
            <ReceiptIcon fontSize="small"/>
          </IconButton>}
          {params.value ?
            <IconButton onClick={() => editLink(params.row)} size="small">
              <Tooltip title={t('Edit')}><EditIcon fontSize="small"/></Tooltip>
            </IconButton> : null}
        </span>, },
  ];

  const editLink = (billing) => {
    axios.get(`${process.env.MIX_API_URL}/api/billings/${billing.id}/edit_link`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      window.open(response.data, '_blank').focus()
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const getData = () => {
    setLoading(true)
    axios.all([
      axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/billings`,{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }),
      axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/paid_messages`,{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
    ]).then(responses => {
      let billing = []
      responses.forEach(response => {
        response.data.forEach(data => {
          if(!data.hasOwnProperty('expired_at')) data.expired_at = ''
          data.no = billing.length
          billing.push(data)
        })
      })
      if(billing.length > 0){
        billing = billing.sort((a, b) => Moment.utc(b.payment_date).valueOf() - Moment.utc(a.payment_date).valueOf())
      }
      setBillings(billing)
      setLoading(false)
    }).catch(error => {
    })
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Billing Report')}</h2>
      </Stack>
      <div className="container-fluid">
        <div className="row">
          {loading ? <div><CircularProgress/></div> : <div style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
            <DataGrid
              rows={billings}
              columns={columns}
              getRowId={(row) => row.no}
              pageSize={10}
              rowsPerPageOptions={[10]}
            />
          </div>}
        </div>
      </div>
    </div>
  );
};
