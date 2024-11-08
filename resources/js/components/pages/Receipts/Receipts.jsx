import {useTranslation} from "react-i18next";
import {useSearchParams} from "react-router-dom";
import eventBus from "../../../eventBus";
import {Button, ButtonGroup, FormControl, Grid, IconButton, InputLabel, Stack, useMediaQuery} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import {datetimeFormat, simpleCatchError} from "../../../helper";
import {DataGrid} from "@mui/x-data-grid";
import React, { useEffect, useState } from 'react'
import axios from "axios";
import Moment from "moment";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Box from "@mui/material/Box";

const Receipts = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [receipts, setReceipts] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [csvLoading, setCSVLoading] = useState(false)
  const [pdfLoading, setPDFLoading] = useState(false)
  const [saftLoading, setSaftLoading] = useState(false)
  const mediaQuery = useMediaQuery("(min-width:600px)");
  const [paymentMethod, setPaymentMethod] = useState({})
  const [filter, setFilter] = useState({
    from: searchParams.get('from') || Moment().add(-1,'days').format('YYYY-MM-DD'),
    to: searchParams.get('to') || Moment().format('YYYY-MM-DD'),
  })
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
  }, [paginationModel,sortModel,filterModel,filter])

  const onFilterChange = React.useCallback((filter) => {
    setFilterModel(filter)
  }, []);

  const onSortChange = React.useCallback((sort) => {
    setSortModel(sort)
  }, []);

  const columns = () => {
    let cols = []
    cols.push({ field: 'place_check_id', headerName: t('ID'), flex: 1, minWidth: 80 })
    cols.push({ field: 'payment_method', headerName: t('Payment method'), flex: 1, minWidth: 80 })
    cols.push({field: 'printed_at', headerName: t('Given'), flex: 1, minWidth: 140,
      renderCell: (params) => params.value ? datetimeFormat(params.value) : datetimeFormat(params.row.created_at)})
    cols.push({ field: 'description', headerName: t('Description'), flex: 2, minWidth: 250 })
    cols.push({field: 'total', headerName: t('Total'), flex: 1, minWidth: 100, type: 'number',
      renderCell: (params) => <>{paymentMethod['online-payment-currency']} {params.value.toFixed(2)}</>})
    cols.push({ field: 'actions', headerName: t('Actions'), width: 80, filterable: false, sortable: false, renderCell: (params) =>
        <span>
          <IconButton onClick={e => { window.open(`/admin/Receipts/${params.row.status === 'refund' ? params.row.parent_id : params.row.id}`, '_blank') }} size="small">
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
      sort_value: sortModel.length > 0 ? sortModel[0].sort : null,
      ...filter
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
      setTotalAmount(response.data.total_amount)
      setReceipts(response.data.data.map(i => {
        return {...i,description: `${t('Booking id')}: #${i.order_id}, ${t('seats')}: ${i.order.seats}, ${t('tables')}: ${i.order.table_ids.join(', ')}`}
      }))
      setLoading(false)
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const exportCSV = () => {
    setCSVLoading(true)
    let params = {
      page: paginationModel.page + 1,
      per_page: paginationModel.pageSize,
      filter_field: filterModel.hasOwnProperty('items') && filterModel.items.length > 0 ? filterModel.items[0].columnField : null,
      filter_value: filterModel.hasOwnProperty('items') && filterModel.items.length > 0 ? filterModel.items[0].value : null,
      sort_field: sortModel.length > 0 ? sortModel[0].field : null,
      sort_value: sortModel.length > 0 ? sortModel[0].sort : null,
      ...filter
    }
    axios.get(`${process.env.MIX_API_URL}/api/receipts/export_csv`, {
      params: {
        ...params,
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      responseType: 'blob'
    }).then(response => {
      const csvBlob = new Blob([response.data], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvBlob);
      window.open(csvUrl, '_blank');
      URL.revokeObjectURL(csvUrl);

      setCSVLoading(false)
    }).catch(error => {
      simpleCatchError(error)
      setCSVLoading(false)
    })
  }

  const exportPDF = () => {
    setPDFLoading(true)
    let params = {
      page: paginationModel.page + 1,
      per_page: paginationModel.pageSize,
      filter_field: filterModel.hasOwnProperty('items') && filterModel.items.length > 0 ? filterModel.items[0].columnField : null,
      filter_value: filterModel.hasOwnProperty('items') && filterModel.items.length > 0 ? filterModel.items[0].value : null,
      sort_field: sortModel.length > 0 ? sortModel[0].field : null,
      sort_value: sortModel.length > 0 ? sortModel[0].sort : null,
      ...filter
    }
    axios.get(`${process.env.MIX_API_URL}/api/receipts/export_pdf`, {
      params: {
        ...params,
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      responseType: 'blob'
    }).then(response => {
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      URL.revokeObjectURL(pdfUrl);

      setPDFLoading(false)
    }).catch(error => {
      simpleCatchError(error)
      setPDFLoading(false)
    })
  }

  const exportSaft = () => {
    setSaftLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/receipts/saft`, {
      params: {
        ...filter,
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
    }).then(response => {
      const xmlBlob = new Blob([response.data.content], { type: 'application/xml' });
      const xmlUrl = URL.createObjectURL(xmlBlob);
      // window.open(xmlUrl, '_blank');

      const downloadLink = document.createElement('a');
      downloadLink.href = xmlUrl;

      downloadLink.download = response.data.filename;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(xmlUrl);

      setSaftLoading(false)
    }).catch(error => {
      simpleCatchError(error)
      setSaftLoading(false)
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

  const setPeriod = (name) => {
    if (name === 'today') {
      setFilter(prev => ({
        ...prev,
        from: Moment().format('YYYY-MM-DD'),
        to: Moment().format('YYYY-MM-DD')
      }))
    }
    if (name === 'yesterday') {
      setFilter(prev => ({
        ...prev,
        from: Moment().add(-1, 'days').format('YYYY-MM-DD'),
        to: Moment().add(-1, 'days').format('YYYY-MM-DD')
      }))
    }
    if (name === 'week') {
      setFilter(prev => ({
        ...prev,
        from: Moment().add(-1, 'weeks').format('YYYY-MM-DD'),
        to: Moment().format('YYYY-MM-DD')
      }))
    }
    if (name === 'month') {
      setFilter(prev => ({
        ...prev,
        from: Moment().add(-1, 'months').format('YYYY-MM-DD'),
        to: Moment().format('YYYY-MM-DD')
      }))
    }
  }

  return (
    <div className='pages__container'>
      <Stack spacing={2} mb={2} direction="row" alignItems="center" flexWrap="wrap">
        <h2>{t('Receipts')}</h2>
        <span style={{marginLeft: 'auto'}}></span>
        {['admin'].includes(window.role) && <Button variant="contained"
                onClick={exportSaft}
                disabled={saftLoading}
                endIcon={saftLoading && <HourglassBottomIcon/>}>{t('SAF-T report')}</Button>}
        <Button variant="contained"
                onClick={exportCSV}
                disabled={csvLoading}
                endIcon={csvLoading && <HourglassBottomIcon/>}>{t('Export CSV')}</Button>
        <Button variant="contained"
                onClick={exportPDF}
                disabled={pdfLoading}
                endIcon={pdfLoading && <HourglassBottomIcon/>}>{t('Export PDF')}</Button>
      </Stack>
      <Grid container spacing={2} sx={{pb: 2}}>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl size="small" fullWidth className="datePickerFullWidth">
            <InputLabel htmlFor="from" shrink>{t('From')}</InputLabel>
            <DatePicker
              dateFormat='yyyy-MM-dd'
              selected={filter.from ? Moment(filter.from).toDate() : ''} id="from"
              onSelect={e => {setFilter(prev => ({...prev, from: e ? Moment(e).format('YYYY-MM-DD') : ''}))}}
              onChange={e => {setFilter(prev => ({...prev, from: e ? Moment(e).format('YYYY-MM-DD') : ''}))}}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl size="small" fullWidth className="datePickerFullWidth">
            <InputLabel htmlFor="to" shrink>{t('To')}</InputLabel>
            <DatePicker
              dateFormat='yyyy-MM-dd'
              selected={filter.to ? Moment(filter.to).toDate() : ''} id="to"
              onSelect={e => {setFilter(prev => ({...prev, to: e ? Moment(e).format('YYYY-MM-DD') : ''}))}}
              onChange={e => {setFilter(prev => ({...prev, to: e ? Moment(e).format('YYYY-MM-DD') : ''}))}}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <ButtonGroup variant="contained" size="small" orientation={`${mediaQuery ? `horizontal` : `vertical`}`}>
            <Button onClick={() => setPeriod('today')}>{t('today')}</Button>
            <Button onClick={() => setPeriod('yesterday')}>{t('yesterday')}</Button>
            <Button onClick={() => setPeriod('week')}>{t('week')}</Button>
            <Button onClick={() => setPeriod('month')}>{t('month')}</Button>
          </ButtonGroup>
        </Grid>
      </Grid>
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
          getRowClassName={(params) => `receipt_status_${params.row.status}`}
        />
      </div>
      <Box sx={{mt:2}}>{t('Total')}: {paymentMethod['online-payment-currency']} {totalAmount.toFixed(2)}</Box>
    </div>
  )
}

export default Receipts
