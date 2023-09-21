import React, {useEffect, useState} from "react";
import  './OpeningTimes.scss';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import Moment from 'moment';
import 'moment/locale/da'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControl,
  FormControlLabel,
  Grid,
  IconButton, InputLabel, MenuItem, Select, styled, Table, TableBody, TableCell, TableHead, TableRow, TextField,
} from "@mui/material";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import EditIcon from "@mui/icons-material/Edit";

export default function TimetableEditPopup(props) {
  const { t } = useTranslation();
  const [timetable, setTimetable] = useState({})
  const [areas, setAreas] = useState([])
  const [tableplans, setTableplans] = useState([])
  const [yearly, setYearly] = useState(false)
  const [editRow, setEditRow] = useState(0)
  const [copy, setCopy] = useState(true)
  const [focusOn, setFocusOn] = useState('')

  const minBeforeTimes = [
    {title: `0 ${t('minutes')}`, value: 0},
    {title: `30 ${t('minutes')}`, value: 30},
    {title: `1 ${t('hour')}`, value: 60},
    {title: `2 ${t('hours')}`, value: 60*2},
    {title: `3 ${t('hours')}`, value: 60*3},
    {title: `4 ${t('hours')}`, value: 60*4},
    {title: `5 ${t('hours')}`, value: 60*5},
    {title: `6 ${t('hours')}`, value: 60*6},
    {title: `8 ${t('hours')}`, value: 60*8},
    {title: `12 ${t('hours')}`, value: 60*12},
    {title: `24 ${t('hours')}`, value: 60*24},
    {title: `36 ${t('hours')}`, value: 60*36},
    {title: `48 ${t('hours')}`, value: 60*48},
    {title: `3 ${t('days')}`, value: 60*24*3},
    {title: `4 ${t('days')}`, value: 60*24*4},
    {title: `5 ${t('days')}`, value: 60*24*5},
    {title: `6 ${t('days')}`, value: 60*24*6},
    {title: `7 ${t('days')}`, value: 60*24*7},
    {title: `14 ${t('days')}`, value: 60*24*14},
    {title: `21 ${t('days')}`, value: 60*24*21},
  ]

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  useEffect(() => {
    if(props.timetable.hasOwnProperty('start_date')){
      setYearly(props.timetable.start_date.startsWith('0004'))
      setTimetable(props.timetable)
      setAreas(props.areas)
      setTableplans(props.tableplans)
    }
  },[props])

  const onChange = (e) => {
    if(e.target.name === 'copy') setCopy(e.target.checked)
    if(e.target.name === 'yearly') {
      setYearly(e.target.checked)
      let year = e.target.checked ? '0004' : Moment.utc().format('YYYY')
      setTimetable(prev => ({...prev,
        start_date: Moment.utc(prev.start_date).format(year+'-MM-DD'),
        end_date: Moment.utc(prev.end_date).format(year+'-MM-DD')
      }))
    }
    if(e.target.name === 'start_date') setTimetable(prev => ({...prev, start_date: normalizeYearOfDate(e.target.value)}))
    if(e.target.name === 'end_date') setTimetable(prev => ({...prev, end_date: normalizeYearOfDate(e.target.value)}))
    if(e.target.name === 'start_time') setTimetable(prev => ({...prev,
      start_time: Moment.utc(e.target.value,'HH:mm:ss').format('HH:mm:ss')}))
    if(e.target.name === 'end_time') setTimetable(prev => ({...prev,
      end_time: Moment.utc(e.target.value,'HH:mm:ss').format('HH:mm:ss')}))
    if(e.target.name === 'week_days') setTimetable(prev => ({...prev, week_days: e.target.value}))
    if(e.target.name === 'area_id') setTimetable(prev => ({...prev, area_id: e.target.value}))
    if(e.target.name === 'tableplan_id') setTimetable(prev => ({...prev, tableplan_id: e.target.value}))
    if(e.target.name === 'length') setTimetable(prev => ({...prev, length: e.target.value}))
    if(e.target.name === 'max') setTimetable(prev => ({...prev, max: intWrapper(e.target.value)}))
    if(e.target.name === 'status') setTimetable(prev => ({...prev, status: e.target.value}))
    if(e.target.name === 'min_time_before') setTimetable(prev => ({...prev, min_time_before: e.target.value}))
  }

  const normalizeYearOfDate = (date) => {
    let year = yearly ? '0004' : 'YYYY'
    return Moment.utc(date).format(year+'-MM-DD')
  }

  const onTimeChange = (e, key) => {
    let time = timetable.booking_limits
    let lastKey = copy ? time.length-1 : key
    for(var i=key;i<=lastKey;i++) {
      if (e.target.name === 'max_books') time[i].max_books = intWrapper(e.target.value)
      if (e.target.name === 'max_seats') time[i].max_seats = intWrapper(e.target.value)
    }
    setTimetable(prev => ({...prev, booking_limits: time}))
    setFocusOn(e.target.name+'_'+key)
  }

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = () => {
    props.onChange(timetable)
  }

  const bookingOptions = () => {
    let length = []
    for(var i=0;i<=1500;i+=15) length.push(i)
    return length
  }

  const timeOptions = () => {
    let time = []
    for(let i=0;i<=24*4;i++){
      let tt = new Date(0);
      tt = new Date(tt.getTime() + i*15*60000)
      time.push((tt.getUTCHours()<10?'0':'')+tt.getUTCHours()+':'+(tt.getMinutes()<10?'0':'')+tt.getMinutes()+':00')
    }
    return time
  }

  const intWrapper = (val) => {
    return isNaN(parseInt(val)) ? 0 : parseInt(val)
  }

  const dateFormat = (date) => {
    let year = yearly ? '0004' : 'YYYY'
    return Moment.utc(date).format(year+'-MM-DD')
  }

  const dateFromFormat = (date) => {
    if(date.startsWith('0004')){
      return new Date(date.replace('0004',Moment.utc().format('YYYY')))
    }else{
      return new Date(date)
    }
  }

  const weekDays = () => {
    Moment.locale(localStorage.getItem('i18nextLng'))
    return Moment.weekdays()
  }

  const tableTime = (key) => {
    var tt = new Date(0);
    tt = new Date(tt.getTime() + key*15*60000)
    return (tt.getHours()<10?'0':'')+tt.getHours()+':'+(tt.getMinutes()<10?'0':'')+tt.getMinutes()
  }

  return (<>
    {timetable.hasOwnProperty('start_date') &&
    <Dialog onClose={handleClose} open={props.open} fullWidth maxWidth="md"
            scroll="paper"
            PaperProps={{
              style: {
                backgroundColor: "#F2F3F9",
              },
            }}
            >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <>&nbsp;</>
        <IconButton onClick={handleClose} sx={{
          position:'absolute',
          right:8,
          top:8,
          color:(theme) => theme.palette.grey[500],
          }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_area_id">{t('Area')}</InputLabel>
              <Select label={t('Area')} value={timetable.area_id || ''} required
                      labelId="label_area_id" id="area_id" name="area_id"
                      onChange={onChange}>
                {areas.map((el,key) => {
                  return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_tableplan_id">{t('Tableplan')}</InputLabel>
              <Select label={t('Tableplan')} value={timetable.tableplan_id || ''}
                      labelId="label_tableplan_id" id="tableplan_id" name="tableplan_id"
                      onChange={onChange}>
                {tableplans.map((el,key) => {
                  return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_status">{t('Status')}</InputLabel>
              <Select label={t('Status')} value={timetable.status}
                      labelId="label_status" id="status" name="status"
                      onChange={onChange}>
                {['working','non-working'].map((el,key) => {
                  return <MenuItem key={key} value={el}>{el}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth className="datePickerFullWidth">
              <InputLabel htmlFor="start_date" shrink>{t('Start date')}</InputLabel>
              <DatePicker
                dateFormat='yyyy-MM-dd'
                selected={dateFromFormat(timetable.start_date)} id="start_date"
                onSelect={e => {onChange({target: {name:'start_date',value:dateFormat(e)}})}}
                onChange={e => {onChange({target: {name:'start_date',value:dateFormat(e)}})}}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth className="datePickerFullWidth">
              <InputLabel htmlFor="end_date" shrink>{t('End date')}</InputLabel>
              <DatePicker
                dateFormat='yyyy-MM-dd'
                selected={dateFromFormat(timetable.end_date)} id="end_date"
                onSelect={e => {onChange({target: {name:'end_date',value:dateFormat(e)}})}}
                onChange={e => {onChange({target: {name:'end_date',value:dateFormat(e)}})}}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
                control={<Checkbox name="yearly" checked={yearly} onChange={onChange}/>}
                label={t('This date every year')}
                labelPlacement="end"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_start_time">{t('From time')}</InputLabel>
              <Select label={t('From time')} value={Moment.utc(timetable.start_time,'HH:mm:ss').format('HH:mm:ss')} required
                      labelId="label_start_time" id="start_time" name="start_time"
                      onChange={onChange}>
                {timeOptions().map((el,key) => {
                  return <MenuItem key={key} value={el}>{el}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_end_time">{t('To time')}</InputLabel>
              <Select label={t('To time')} value={Moment.utc(timetable.end_time,'HH:mm:ss').format('HH:mm:ss')} required
                      labelId="label_end_time" id="end_time" name="end_time"
                      onChange={onChange}>
                {timeOptions().map((el,key) => {
                  return <MenuItem key={key} value={el}>{el}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_week_days">{t('Week days')}</InputLabel>
              <Select label={t('Week days')} value={timetable.week_days} multiple
                      labelId="label_week_days" id="week_days" name="week_days"
                      onChange={onChange}>
                {weekDays().map((el,key) => {
                  return <MenuItem key={key} value={key}>{el}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_length">{t('Length')}</InputLabel>
              <Select label={t('Length')} value={timetable.length}
                      labelId="label_length" id="length" name="length"
                      onChange={onChange}>
                {bookingOptions().map((el,key) => {
                  return <MenuItem key={key} value={el}>{el}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label={t('Max seats')} size="small" fullWidth
                       type="number" id="max" name="max" required
                       onChange={onChange} value={timetable.max}
                       />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_min_time_before">{t('Minimum time before book')}</InputLabel>
              <Select label={t('Minimum time before book')} value={timetable.min_time_before}
                      labelId="label_min_time_before" id="min_time_before" name="min_time_before"
                      onChange={onChange}>
                {minBeforeTimes.map((el,key) => {
                  return <MenuItem key={key} value={el.value}>{el.title}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small"></TableCell>
                  <TableCell size="small">{t('Time')}</TableCell>
                  <TableCell size="small">{t('Max booking')}</TableCell>
                  <TableCell size="small">{t('Max pax')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timetable.booking_limits.map((time,key) => {
                  return <StyledTableRow key={key}>
                    <TableCell size="small">
                      {key === editRow ?
                        <></>
                        :
                        <IconButton onClick={e => {setEditRow(key)}} size="small">
                          <EditIcon fontSize="small"/>
                        </IconButton>
                      }
                    </TableCell>
                    <TableCell size="small">{tableTime(key)}</TableCell>
                    <TableCell size="small">
                      {key === editRow ?
                        <TextField id={`max_books_${key}`} type="text" name="max_books" size="small" fullWidth
                                   variant="standard" autoFocus={focusOn === `max_books_${key}`}
                                   value={intWrapper(time.max_books)} onChange={e => {onTimeChange(e,key)}}/>
                        :
                        <>{time.max_books}</>
                      }
                    </TableCell>
                    <TableCell size="small">
                      {key === editRow ?
                        <TextField id={`max_seats_${key}`} type="text" name="max_seats" size="small" fullWidth
                                   variant="standard" autoFocus={focusOn === `max_seats_${key}`}
                                   value={intWrapper(time.max_seats)} onChange={e => {onTimeChange(e,key)}}/>
                        :
                        <>{time.max_seats}</>
                      }
                    </TableCell>
                  </StyledTableRow>
                })}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <FormControlLabel sx={{mr:'auto'}}
                          control={<Checkbox name="copy" checked={copy} onChange={onChange}/>}
                          label={t('Copy values down')}
                          labelPlacement="end"
        />
        <Button variant="outlined" onClick={handleClose}>{t('Cancel')}</Button>
        <Button variant="contained" onClick={handleSave}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>}
  </>);
};
