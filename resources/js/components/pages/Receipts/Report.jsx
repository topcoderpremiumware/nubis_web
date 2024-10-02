import {useTranslation} from "react-i18next";
import eventBus from "../../../eventBus";
import {
  Button,
  ButtonGroup,
  Card,
  CardContent, CircularProgress, Container,
  FormControl,
  Grid,
  InputLabel, MenuItem, Select,
  Stack,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Typography, useMediaQuery
} from "@mui/material";
import {currency_format, simpleCatchError} from "../../../helper";
import React, { useEffect, useState } from 'react'
import axios from "axios";
import Moment from "moment/moment";
import 'moment/locale/da'
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import {LineChart} from '@mui/x-charts/LineChart';
import {StyledTableRow} from "../../components/StyledTableRow";
import Box from "@mui/material/Box";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Report = () => {
  const {t} = useTranslation();
  const [filter, setFilter] = useState({
    from: Moment().add(-1, 'days').format('YYYY-MM-DD'),
    to: Moment().format('YYYY-MM-DD'),
    compare: 'period'
  })
  const [incomes, setIncomes] = useState([])
  const [compareIncomes, setCompareIncomes] = useState([])
  const [total, setTotal] = useState(0)
  const [number, setNumber] = useState(0)
  const [numberReturned, setNumberReturned] = useState(0)
  const [compareTotal, setCompareTotal] = useState(0)
  const [compareNumber, setCompareNumber] = useState(0)
  const [compareNumberReturned, setCompareNumberReturned] = useState(0)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState({})
  const [paymentMethods, setPaymentMethods] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [categoriesReport, setCategoriesReport] = useState([])
  const mediaQuery = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    // getReport()
    getPaymentMethod()
    eventBus.on("placeChanged", () => {
      getReport()
      getCategoriesReport()
      getPaymentMethod()
    })
    Moment.locale(localStorage.getItem('i18nextLng'))
  }, [])

  useEffect(() => {
    getReport()
    getCategoriesReport()
  }, [filter])

  const getReport = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/receipts_report`, {
      params: {
        ...filter,
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setIncomes(response.data.incomes)
      setCompareIncomes(response.data.compare_incomes)
      setTotal(response.data.total)
      setNumber(response.data.number)
      setNumberReturned(response.data.number_returned)
      setPaymentMethods(response.data.payment_methods)
      setDiscounts(response.data.discounts)
      setCompareTotal(response.data.compare_total)
      setCompareNumber(response.data.compare_number)
      setCompareNumberReturned(response.data.compare_number_returned)
      setLoading(false)
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const getCategoriesReport = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/receipts_category_report`, {
      params: {
        ...filter,
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setCategoriesReport(response.data)
      setLoading(false)
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const getPaymentMethod = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/payment_method`, {
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

  const compareDiff = () => {
    let avg, cAvg
    if (number === 0) {
      avg = 0
    } else {
      avg = total / number
    }
    if (compareNumber === 0) {
      cAvg = 0
    } else {
      cAvg = compareTotal / compareNumber
    }
    return avg - cAvg
  }

  const discount_types = {
    our_code_amount: t('Our gift card'),
    code_amount: t('Other gift card'),
    custom_amount: t('Custom amount'),
    custom_percent: t('Custom percent')
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Sales details')}</h2>
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
      <Grid container spacing={2} sx={{pb: 2}}>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel id="label_compare">{t('Compared to')}</InputLabel>
            <Select label={t('Compared to')} value={filter.compare}
                    labelId="label_compare" id="compare" name="compare"
                    onChange={e => {setFilter(prev => ({...prev, compare: e.target.value}))}}>
              {[{n:'period',l:t('Last period')},{n:'year',l:t('Last year')}].map((el,key) => {
                return <MenuItem key={key} value={el.n}>{el.l}</MenuItem>
              })}
            </Select>
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
                {paymentMethod['online-payment-currency']} {currency_format(total)}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '20px' }} gutterBottom>
                {total > 0 && <span style={{color: `${(total - compareTotal) < 0 ? 'red' : 'green'}`}}>
                  {(total - compareTotal) !== 0 && <>{(total - compareTotal) < 0 ? <ExpandMoreIcon/> : <ExpandLessIcon/>}</>}&nbsp;
                  {(Math.abs(total - compareTotal) * 100 / total).toFixed(0)}%&nbsp;
                </span>}
                <span style={{color: '#C0C0C0'}}>
                  ({paymentMethod['online-payment-currency']} {currency_format(total - compareTotal)})
                </span>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{padding: '16px 24px 12px !important'}}>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '16px', mb: 1 }}>
                {t('Number of sales')}
              </Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 500, lineHeight: '20px' }} gutterBottom>
                {number ? number.toFixed(0) : (0).toFixed(0)}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '20px' }} gutterBottom>
                {number > 0 && <span style={{color: `${(number - compareNumber) < 0 ? 'red' : 'green'}`}}>
                  {(number - compareNumber) !== 0 && <>{(number - compareNumber) < 0 ? <ExpandMoreIcon/> : <ExpandLessIcon/>}</>}&nbsp;
                  {(Math.abs(number - compareNumber) * 100 / number).toFixed(0)}%&nbsp;
                </span>}
                <span style={{color: '#C0C0C0'}}>
                  ({number - compareNumber})
                </span>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{padding: '16px 24px 12px !important'}}>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '16px', mb: 1 }}>
                {t('Average sales amount')}
              </Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 500, lineHeight: '20px' }} gutterBottom>
                {paymentMethod['online-payment-currency']} {currency_format(number ? total/number : 0)}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '20px' }} gutterBottom>
                {number > 0 && <span style={{color: `${compareDiff() < 0 ? 'red' : 'green'}`}}>
                  {compareDiff() !== 0 && <>{compareDiff() < 0 ? <ExpandMoreIcon/> : <ExpandLessIcon/>}</>}&nbsp;
                  {(Math.abs(compareDiff()) * 100 / (total/number)).toFixed(0)}%&nbsp;
                </span>}
                <span style={{color: '#C0C0C0'}}>
                  ({paymentMethod['online-payment-currency']} {currency_format(compareDiff())})
                </span>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{padding: '16px 24px 12px !important'}}>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '16px', mb: 1 }}>
                {t('Number of returns')}
              </Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 500, lineHeight: '20px' }} gutterBottom>
                {numberReturned ? numberReturned.toFixed(0) : (0).toFixed(0)}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '20px' }} gutterBottom>
                {numberReturned > 0 && <span style={{color: `${(numberReturned - compareNumberReturned) < 0 ? 'red' : 'green'}`}}>
                  {(numberReturned - compareNumberReturned) !== 0 && <>{(numberReturned - compareNumberReturned) < 0 ? <ExpandMoreIcon/> : <ExpandLessIcon/>}</>}&nbsp;
                  {(Math.abs(numberReturned - compareNumberReturned) * 100 / numberReturned).toFixed(0)}%&nbsp;
                </span>}
                <span style={{color: '#C0C0C0'}}>
                  ({(numberReturned - compareNumberReturned).toFixed(0)})
                </span>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {(loading || incomes.length !== compareIncomes.length) ? <div><CircularProgress/></div> :
      <LineChart
        xAxis={[{
          id: 'Time',
          dataKey: 'date',
          scaleType: 'point',
          valueFormatter: (date) => Moment(date).format('DD MMM YYYY'),
          label: t('Date'),
          data: incomes.map(el => el.date),
        }]}
        series={[
          {
            id: 'thisPeriod',
            color: '#FF9763',
            curve: "linear",
            valueFormatter: (value) => `${value ? value.toFixed(2) : ''}`,
            label: `${t('This period')} (${paymentMethod['online-payment-currency']})`,
            data: incomes.map(el => el.value),
          },
          {
            id: 'prevPeriod',
            color: '#808080',
            curve: "linear",
            valueFormatter: (value) => `${value ? value.toFixed(2) : ''}`,
            label: `${t('Previous period')} (${paymentMethod['online-payment-currency']})`,
            data: compareIncomes.map(el => el.value),
          },
        ]}
        height={400}
      />}
      <Container maxWidth="md" disableGutters={true}>
        <Box sx={{mt:3}}><h5>{t('Payment methods')}</h5></Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell size="small"><b>{t('Payment method')}</b></TableCell>
                <TableCell size="small" align="right"><b>{t('Amount')}</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentMethods.map((item, key) => {
                return <StyledTableRow key={key}>
                  <TableCell size="small">{item.payment_method}</TableCell>
                  <TableCell size="small" align="right">{paymentMethod['online-payment-currency']} {currency_format(item.value)}</TableCell>
                </StyledTableRow>
              })}
              <StyledTableRow>
                <TableCell size="small"><b>{t('Total')}</b></TableCell>
                <TableCell size="small" align="right"><b>{paymentMethod['online-payment-currency']} {currency_format(total)}</b></TableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{mt:3}}><h5>{t('Discount methods')}</h5></Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell size="small"><b>{t('Discount method')}</b></TableCell>
                <TableCell size="small" align="right"><b>{t('Amount')}</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discounts.map((item, key) => {
                return <StyledTableRow key={key}>
                  <TableCell size="small">{discount_types[item.discount_type]}</TableCell>
                  <TableCell size="small" align="right">{paymentMethod['online-payment-currency']} {currency_format(item.value)}</TableCell>
                </StyledTableRow>
              })}
              <StyledTableRow>
                <TableCell size="small"><b>{t('Total')}</b></TableCell>
                <TableCell size="small" align="right">
                  <b>{paymentMethod['online-payment-currency']} {currency_format(discounts.reduce((sum,i) => sum + i.value,0))}</b>
                </TableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{mt:3}}><h5>{t('Sales by categories')}</h5></Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell size="small"><b>{t('Category')}</b></TableCell>
                <TableCell size="small" align="right"><b>{t('Amount')}</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoriesReport.map((item, key) => {
                return <StyledTableRow key={key}>
                  <TableCell size="small" style={{paddingLeft: `${8 * item.path.split('.').length}px`}}>{item.name}</TableCell>
                  <TableCell size="small" align="right">{paymentMethod['online-payment-currency']} {currency_format(item.value)}</TableCell>
                </StyledTableRow>
              })}
              <StyledTableRow>
                <TableCell size="small"><b>{t('Total')}</b></TableCell>
                <TableCell size="small" align="right"><b>{paymentMethod['online-payment-currency']} {currency_format(total)}</b></TableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </div>
  )
}

export default Report
