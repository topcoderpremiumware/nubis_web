import React, {useEffect, useState} from "react";
import  './BillingReport.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import {
  CircularProgress,
  IconButton
} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import Moment from "moment";
import {DataGrid} from "@mui/x-data-grid";

export default function BillingReport() {
  const {t} = useTranslation();

  const [billings, setBillings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect( () => {
    getBillings()
    eventBus.on("placeChanged", () => {
      getBillings()
    })
  }, [])

  const columns = [
    { field: 'payment_date', headerName: t('Date'), minWidth: 200 },
    { field: 'expired_at', headerName: t('Expired'), minWidth: 200 },
    { field: 'product_name', headerName: t('Name'), flex: 1 },
    { field: 'amount', headerName: t('Amount'), maxWidth: 100 },
    { field: 'currency', headerName: t('Currency'), maxWidth: 100 },
    { field: 'payment_intent_id', headerName: t('Id'), minWidth: 250 },
    { field: 'receipt_url', headerName: t('Receipt'), maxWidth: 100, renderCell: (params) =>
        <span>
          {params.value && <IconButton onClick={() => window.open(params.value, '_blank').focus()} size="small">
            <ReceiptIcon fontSize="small"/>
          </IconButton>}
        </span>, },
  ];

  const getBillings = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/billings`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setBillings(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  return (
    <div className='pages__container'>
      <h2>{t('Billing Report')}</h2>
      <div className="container-fluid">
        <div className="row">
          {loading ? <div><CircularProgress/></div> : <div style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
            <DataGrid
              rows={billings}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
            />
          </div>}
        </div>
      </div>
    </div>
  );
};
