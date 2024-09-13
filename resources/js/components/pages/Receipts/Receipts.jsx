import {useTranslation} from "react-i18next";
import {useSearchParams} from "react-router-dom";
import eventBus from "../../../eventBus";
import moment from "moment/moment";
import {IconButton, Stack} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import {datetimeFormat, simpleCatchError} from "../../../helper";
import {DataGrid} from "@mui/x-data-grid";
import React, { useEffect, useState } from 'react'
import axios from "axios";

const Receipts = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [receipts, setReceipts] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState({})
  const [paginationModel, setPaginationModel] = React.useState({
    page: parseInt(searchParams.get('page')) || 0,
    pageSize: parseInt(searchParams.get('per_page')) || 20,
  });
  const [filterModel, setFilterModel] = React.useState({items: (searchParams.get('filter_field') && searchParams.get('filter_field') !== 'null') ? [{
      columnField: searchParams.get('filter_field'),
      value: searchParams.get('filter_value')
    }] : [],logicOperator: "and",
    quickFilterLogicOperator: "and", quickFilterValues: []});
  const [sortModel, setSortModel] = React.useState((searchParams.get('sort_field') && searchParams.get('sort_field') !== 'null') ? [{
    field: searchParams.get('sort_field'),
    sort: searchParams.get('sort_value')
  }] : []);

  useEffect(() => {
    getReceipts()
    getPaymentMethod()
    eventBus.on("placeChanged", () => {
      getReceipts()
      getPaymentMethod()
    })
  }, [])

  useEffect(() => {
    getReceipts()
  }, [paginationModel,sortModel,filterModel])

  const onFilterChange = React.useCallback((filter) => {
    setFilterModel(filter)
  }, []);

  const onSortChange = React.useCallback((sort) => {
    setSortModel(sort)
  }, []);

  const columns = () => {
    let cols = []
    cols.push({ field: 'id', headerName: t('ID'), flex: 1, minWidth: 80 })
    cols.push({ field: 'payment_method', headerName: t('Payment method'), flex: 1, minWidth: 80 })
    cols.push({field: 'printed_at', headerName: t('Given'), flex: 1, minWidth: 140, renderCell: (params) => datetimeFormat(params.value)})
    cols.push({ field: 'description', headerName: t('Description'), flex: 2, minWidth: 250 })
    cols.push({field: 'total', headerName: t('Total'), flex: 1, minWidth: 100, type: 'number', renderCell: (params) => <>{paymentMethod['online-payment-currency']} {params.value.toFixed(2)}</>})
    cols.push({ field: 'actions', headerName: t('Actions'), width: 80, filterable: false, sortable: false, renderCell: (params) =>
        <span>
          <IconButton onClick={e => { window.open(`/admin/Receipts/${params.row.id}`, '_blank') }} size="small">
            <ReceiptIcon fontSize="small"/>
          </IconButton>
        </span>, })
    return cols
  }

  const getReceipts = async () => {
    setLoading(true)
    let params = {
      page: paginationModel.page + 1,
      per_page: paginationModel.pageSize,
      filter_field: filterModel.hasOwnProperty('items') && filterModel.items.length > 0 ? filterModel.items[0].columnField : null,
      filter_value: filterModel.hasOwnProperty('items') && filterModel.items.length > 0 ? filterModel.items[0].value : null,
      sort_field: sortModel.length > 0 ? sortModel[0].field : null,
      sort_value: sortModel.length > 0 ? sortModel[0].sort : null
    }
    await axios.get(`${process.env.MIX_API_URL}/api/receipts`, {
      params: {
        ...params,
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setSearchParams({...params,page:params.page-1})
      setTotalRows(response.data.total)
      setReceipts(response.data.data.map(i => {
        return {...i,description: `${t('Booking id')}: #${i.order_id}, ${t('seats')}: ${i.order.seats}, ${t('tables')}: ${i.order.table_ids.join(', ')}`}
      }))
      setLoading(false)
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const getPaymentMethod = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/payment_method`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    setPaymentMethod(res.data)
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Receipts')}</h2>
      </Stack>
      <div style={{ width: '100%', height: 'calc(100vh - 300px)' }}>
        <DataGrid
          paginationMode="server"
          filterMode="server"
          sortingMode="server"
          rowCount={totalRows}
          loading={loading}
          rowsPerPageOptions={[paginationModel.pageSize]}
          pagination
          page={paginationModel.page}
          pageSize={paginationModel.pageSize}
          onPageChange={(newPage) => setPaginationModel(prev => ({...prev,page: newPage}))}
          onPageSizeChange={(newPageSize) => setPaginationModel(prev => ({...prev,pageSize: newPageSize}))}
          filterModel={filterModel}
          onFilterModelChange={onFilterChange}
          sortModel={sortModel}
          onSortModelChange={onSortChange}
          // onPreferencePanelClose={() => {getReceipts()}}
          rows={receipts}
          columns={columns()}
        />
      </div>
    </div>
  )
}

export default Receipts
