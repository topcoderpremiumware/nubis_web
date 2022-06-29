import React, {useEffect, useState} from "react";
import  './OpeningTimes.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import CloseIcon from '@mui/icons-material/Close';
import Moment from 'moment';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControl,
  FormControlLabel,
  Grid,
  IconButton, InputLabel, MenuItem, Select,
} from "@mui/material";
import DatePicker from "react-datepicker";

export default function TimetableEditPopup(props) {
  const { t } = useTranslation();
  const [timetable, setTimetable] = useState({})
  const [areas, setAreas] = useState([])
  const [tableplans, setTableplans] = useState([])
  const [yearly, setYearly] = useState(false)

  useEffect(() => {
    if(props.timetable.hasOwnProperty('start_date')){
      if(props.timetable.start_date.startsWith('0004')) setYearly(true)
      setTimetable(props.timetable)
      setAreas(props.areas)
      setTableplans(props.tableplans)
    }
  },[props])

  const onChange = (e) => {
    console.log('change',e)
    if(e.target.name === 'yearly') setYearly(e.target.checked)
    if(e.target.name === 'start_date') setTimetable(prev => ({...prev, start_date: e.target.value}))
    if(e.target.name === 'end_date') setTimetable(prev => ({...prev, end_date: e.target.value}))
    if(e.target.name === 'start_time') setTimetable(prev => ({...prev, start_time: e.target.value}))
    if(e.target.name === 'end_time') setTimetable(prev => ({...prev, end_time: e.target.value}))
    if(e.target.name === 'week_days') setTimetable(prev => ({...prev, week_days: e.target.value}))
    if(e.target.name === 'area_id') setTimetable(prev => ({...prev, area_id: e.target.value}))
    if(e.target.name === 'tableplan_id') setTimetable(prev => ({...prev, tableplan_id: e.target.value}))
    if(e.target.name === 'length') setTimetable(prev => ({...prev, length: e.target.value}))
    if(e.target.name === 'max') setTimetable(prev => ({...prev, max: intWrapper(e.target.value)}))
    if(e.target.name === 'status') setTimetable(prev => ({...prev, status: e.target.value}))
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
    for(var i=0;i<=24*4;i++){
      let tt = Moment(0);
      tt = Moment(tt.valueOf() + i*15*60000)
      time.push(tt.format('hh:mm:00'))
    }
    return time
  }

  const intWrapper = (val) => {
    return isNaN(parseInt(val)) ? 0 : parseInt(val)
  }

  const dateFormat = (date) => {
    return Moment(date).format('YYYY-MM-DD')
  }

  return (<>
    {timetable.hasOwnProperty('start_date') &&
    <Dialog onClose={handleClose} open={props.open} fullWidth maxWidth="md" scroll="paper">
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
          <Grid item sm={4}>
            <FormControlLabel
                control={<DatePicker
                  selected={new Date(timetable.start_date)}
                  onSelect={e => {onChange({target: {name:'start_date',value:dateFormat(e)}})}}
                />}
                label={t('Start date')}
                labelPlacement="top"
            />
          </Grid>
          <Grid item sm={4}>
            <FormControlLabel
                control={<Checkbox name="yearly" checked={yearly} onChange={onChange}/>}
                label={t('This date every year')}
                labelPlacement="end"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="outlined" onClick={handleClose}>{t('Cancel')}</Button>
        <Button variant="contained" onClick={handleSave}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>}
  </>);
};
