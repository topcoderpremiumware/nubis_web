import {useTranslation} from "react-i18next";
import eventBus from "../../../eventBus";
import {Card, CardContent, FormControl, Grid, InputLabel, Stack, Typography} from "@mui/material";
import {simpleCatchError} from "../../../helper";
import React, { useEffect, useState } from 'react'
import axios from "axios";
import Moment from "moment/moment";
import 'moment/locale/da'
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart } from '@mui/x-charts/LineChart';

const Report = () => {
  const { t } = useTranslation();
  const [from, setFrom] = useState(Moment().add(-1,'days').format('YYYY-MM-DD'))
  const [to, setTo] = useState(Moment().format('YYYY-MM-DD'))
  const [incomes, setIncomes] = useState([])
  const [total, setTotal] = useState(0)
  const [number, setNumber] = useState(0)
  const [numberReturned, setNumberReturned] = useState(0)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState({})

  useEffect(() => {
    // getReport()
    getPaymentMethod()
    eventBus.on("placeChanged", () => {
      getReport()
      getPaymentMethod()
    })
    Moment.locale(localStorage.getItem('i18nextLng'))
  }, [])

  useEffect(() => {
    getReport()
  }, [from,to])

  const getReport = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/receipts_report`, {
      params: {
        from: from,
        to: to,
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setIncomes(response.data.incomes.map(el => ({...el,date: Date.parse(el.date)})))
      setTotal(response.data.total)
      setNumber(response.data.number)
      setNumberReturned(response.data.number_returned)
      setLoading(false)
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const getPaymentMethod = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/payment_method`)
    setPaymentMethod(res.data)
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Sales details')}</h2>
      </Stack>
      <Grid container spacing={2} sx={{pb: 2}}>
        <Grid item xs={12} sm={4}>
          <FormControl size="small" fullWidth className="datePickerFullWidth">
            <InputLabel htmlFor="from" shrink>{t('From')}</InputLabel>
            <DatePicker
              dateFormat='yyyy-MM-dd'
              selected={new Date(from)} id="from"
              onSelect={e => {setFrom(Moment.utc(e).format('YYYY-MM-DD'))}}
              onChange={e => {setFrom(Moment.utc(e).format('YYYY-MM-DD'))}}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl size="small" fullWidth className="datePickerFullWidth">
            <InputLabel htmlFor="to" shrink>{t('To')}</InputLabel>
            <DatePicker
              dateFormat='yyyy-MM-dd'
              selected={new Date(to)} id="to"
              onSelect={e => {setTo(Moment.utc(e).format('YYYY-MM-DD'))}}
              onChange={e => {setTo(Moment.utc(e).format('YYYY-MM-DD'))}}
            />
          </FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{pb: 2}}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{padding: '16px 24px 12px !important'}}>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '16px', mb: 1 }}>
                {t('Total sales')}
              </Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 500, lineHeight: '20px' }} gutterBottom>
                {paymentMethod['online-payment-currency']} {total.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              hello
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              hello
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              hello
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <LineChart
        dataset={incomes}
        xAxis={[{
          id: 'Time',
          dataKey: 'date',
          scaleType: 'time',
          valueFormatter: (date) => Moment(date).format('DD MMM YYYY'),
        }]}
        series={[{
          id: 'Amount',
          dataKey: 'value',
          color: '#FF9763',
          area: true,
          curve: "linear",
          valueFormatter: (value) => `${paymentMethod['online-payment-currency']} ${value.toFixed(2)}`,
        }]}
        height={400}
        // margin={{ top: 30, bottom: 30, left: 30, right: 30 }}
      />
    </div>
  )
}

export default Report
