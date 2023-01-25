import React, {useEffect, useState} from "react";
import  './CustomBookingLength.scss';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import Moment from 'moment';
import 'moment/locale/nl'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControl,
  FormControlLabel, FormGroup, FormLabel,
  Grid,
  IconButton, InputLabel, MenuItem, Select, TextField,
} from "@mui/material";
import DatePicker from "react-datepicker";
import ListSubheader from "@mui/material/ListSubheader";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PictureUploadButton from "../GeneralSettings/Pictures/PictureUploadButton";

export default function CustomBookingLengthEditPopup(props) {
  const { t } = useTranslation();
  const [areas, setAreas] = useState([])
  const [lengths, setLengths] = useState({})
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('i18nextLng'))
  const [img, setImg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if(props.lengths.hasOwnProperty('start_date')){
      setAreas(props.areas)
      setLengths(props.lengths)
      if(props.lengths.image) setImg(props.lengths.image_url)
    }
  },[props])

  const onChange = (e) => {
    if(e.target.name.startsWith('week_days[')){
      let value = parseInt(e.target.name.replace(/\D/g, ""))
      let week_days = lengths.week_days.map(i => Number(i))
      let index = week_days.indexOf(value)
      if(index !== -1) week_days.splice(index, 1);
      if(e.target.checked) week_days.push(value)
      setLengths(prev => ({...prev, week_days: week_days}))
    }
    if(e.target.name.startsWith('week_days_all')){
      let week_days  = []
      if(e.target.checked){
        week_days = [0,1,2,3,4,5,6]
      }
      setLengths(prev => ({...prev, week_days: week_days}))
    }
    if(e.target.name.startsWith('month_days[')){
      let value = parseInt(e.target.name.replace(/\D/g, ""))
      let month_days = lengths.month_days.map(i => Number(i))
      let index = month_days.indexOf(value)
      if(index !== -1) month_days.splice(index, 1);
      if(e.target.checked) month_days.push(value)
      setLengths(prev => ({...prev, month_days: month_days}))
    }
    if(e.target.name.startsWith('month_days_all')){
      let month_days  = []
      if(e.target.checked){
        month_days = Array(31).fill().map((x,i)=>i+1)
      }
      setLengths(prev => ({...prev, month_days: month_days}))
    }
    if(e.target.name.startsWith('spec_dates_date[')){
      let index = parseInt(e.target.name.replace(/\D/g, ""))
      let spec_dates = lengths.spec_dates
      spec_dates[index].date = e.target.value
      setLengths(prev => ({...prev, spec_dates: spec_dates}))
    }
    if(e.target.name.startsWith('spec_dates_active[')){
      let index = parseInt(e.target.name.replace(/\D/g, ""))
      let spec_dates = lengths.spec_dates
      spec_dates[index].active = e.target.checked ? 1 : 0
      setLengths(prev => ({...prev, spec_dates: spec_dates}))
    }
    if(e.target.name.startsWith('time_intervals_from[')){
      let index = parseInt(e.target.name.replace(/\D/g, ""))
      let time_intervals = lengths.time_intervals
      time_intervals[index].from = e.target.value
      setLengths(prev => ({...prev, time_intervals: time_intervals}))
    }
    if(e.target.name.startsWith('time_intervals_to[')){
      let index = parseInt(e.target.name.replace(/\D/g, ""))
      let time_intervals = lengths.time_intervals
      time_intervals[index].to = e.target.value
      setLengths(prev => ({...prev, time_intervals: time_intervals}))
    }
    if(e.target.name.startsWith('area_ids[')){
      let value = parseInt(e.target.name.replace(/\D/g, ""))
      let area_ids = lengths.area_ids
      let index = area_ids.indexOf(value)
      if(index !== -1) area_ids.splice(index, 1);
      if(e.target.checked) area_ids.push(value)
      setLengths(prev => ({...prev, area_ids: area_ids}))
    }
    if(e.target.name === 'image') {
      const file = e.target.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        setImg(reader.result)
        setLengths(prev => ({ ...prev, image: file }))
      };
    }
    if(e.target.name === 'name') setLengths(prev => ({...prev, name: e.target.value}))
    if(e.target.name === 'length') setLengths(prev => ({...prev, length: e.target.value}))
    if(e.target.name === 'preparation_length') setLengths(prev => ({...prev, preparation_length: e.target.value}))
    if(e.target.name === 'active') setLengths(prev => ({...prev, active: e.target.checked ? 1 : 0}))
    if(e.target.name === 'start_date') setLengths(prev => ({...prev, start_date: e.target.value}))
    if(e.target.name === 'end_date') setLengths(prev => ({...prev, end_date: e.target.value}))
    if(e.target.name === 'min') setLengths(prev => ({...prev, min: e.target.value}))
    if(e.target.name === 'max') setLengths(prev => ({...prev, max: e.target.value}))
    if(e.target.name === 'languages') setSelectedLang(e.target.value)
    if(e.target.name === 'priority') setLengths(prev => ({...prev, priority: e.target.value}))
    if(e.target.name === 'labels_name'){
      let labels = lengths.labels
      if(!labels.hasOwnProperty(selectedLang)) labels[selectedLang] = {name: '', description: ''}
      labels[selectedLang]['name'] = e.target.value
      setLengths(prev => ({...prev, labels: labels}))
    }
    if(e.target.name === 'labels_description'){
      let labels = lengths.labels
      if(!labels.hasOwnProperty(selectedLang)) labels[selectedLang] = {name: '', description: ''}
      labels[selectedLang]['description'] = e.target.value
      setLengths(prev => ({...prev, labels: labels}))
    }
  }

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = async () => {
    setLoading(true)
    let result = await props.onChange(lengths)
    setLoading(false)
  }

  const bookingOptions = () => {
    let length = []
    for(var i=0;i<=1500;i+=15) length.push(i)
    return length
  }

  const preparationOptions = () => {
    let length = []
    for(var i=0;i<=30;i+=15) length.push(i)
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

  const weekDays = () => {
    Moment.locale(localStorage.getItem('i18nextLng'))
    return Moment.weekdays()
  }

  const monthDays = () => {
    let days = []
    for(let i=1;i<=31;i++){
      days.push(i)
    }
    return days
  }

  const deleteSpecDate = (key) => {
    let spec_dates = lengths.spec_dates;
    spec_dates.splice(key, 1)
    setLengths(prev => ({...prev, spec_dates: spec_dates}))
  }

  const addSpecDate = () => {
    let spec_dates = lengths.spec_dates;
    spec_dates.push({
      date: Moment().format('YYYY-MM-DD'),
      active: 1
    })
    setLengths(prev => ({...prev, spec_dates: spec_dates}))
  }

  const deleteTimeIntervals = (key) => {
    let time_intervals = lengths.time_intervals;
    time_intervals.splice(key, 1)
    setLengths(prev => ({...prev, time_intervals: time_intervals}))
  }

  const addTimeIntervals = () => {
    let time_intervals = lengths.time_intervals;
    time_intervals.push({
      from: '00:00:00',
      to: '23:00:00'
    })
    setLengths(prev => ({...prev, time_intervals: time_intervals}))
  }

  return (<>
    {lengths.hasOwnProperty('start_date') &&
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
        <PictureUploadButton name="image" onChange={onChange} />
        {img &&
          <div>
            <br />
            <img src={img} alt="image" width={200} height={'auto'} />
          </div>
        }
        <ListSubheader component="div" disableSticky sx={{mb:2}}>{t('General Info')}</ListSubheader>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={4}>
            <TextField label={t('Name')} size="small" fullWidth
                       type="text" id="name" name="name" required
                       onChange={onChange} value={lengths.name}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_length">{t('Length')}</InputLabel>
              <Select label={t('Length')} value={lengths.length}
                      labelId="label_length" id="length" name="length"
                      onChange={onChange}>
                {bookingOptions().map((el,key) => {
                  return <MenuItem key={key} value={el}>{el}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox name="active" checked={parseInt(lengths.active) === 1} onChange={onChange}/>}
              label={t('Active')}
              labelPlacement="end"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_preparation_length">{t('Preparation Length')}</InputLabel>
              <Select label={t('Preparation Length')} value={lengths.preparation_length}
                      labelId="label_preparation_length" id="preparation_length" name="preparation_length"
                      onChange={onChange}>
                {preparationOptions().map((el,key) => {
                  return <MenuItem key={key} value={el}>{el}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <ListSubheader component="div" disableSticky sx={{mb:2}}>{t('Calendar Selection')}</ListSubheader>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth className="datePickerFullWidth">
              <InputLabel htmlFor="start_date" shrink>{t('Start date')}</InputLabel>
              <DatePicker
                dateFormat='yyyy-MM-dd'
                selected={new Date(lengths.start_date)} id="start_date"
                onSelect={e => {onChange({target: {name:'start_date',value:Moment(e).format('YYYY-MM-DD')}})}}
                onChange={e => {onChange({target: {name:'start_date',value:Moment(e).format('YYYY-MM-DD')}})}}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth className="datePickerFullWidth">
              <InputLabel htmlFor="end_date" shrink>{t('End date')}</InputLabel>
              <DatePicker
                dateFormat='yyyy-MM-dd'
                selected={new Date(lengths.end_date)} id="end_date"
                onSelect={e => {onChange({target: {name:'end_date',value:Moment(e).format('YYYY-MM-DD')}})}}
                onChange={e => {onChange({target: {name:'end_date',value:Moment(e).format('YYYY-MM-DD')}})}}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={4}>
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend">{t('Active weekdays')}</FormLabel>
              <FormGroup>
                {weekDays().map((item,key) =>{
                  return <FormControlLabel
                    key={key}
                    control={
                      <Checkbox sx={{py:0}} name={`week_days[${key}]`}
                                checked={lengths.week_days.map(i => Number(i)).includes(key)} onChange={onChange}/>
                    }
                    label={item}
                  />
                })}
                <FormControlLabel
                  control={
                    <Checkbox sx={{py:0}} name={`week_days_all`}
                              checked={lengths.week_days.length === 7} onChange={onChange}/>
                  }
                  label={t('All')}
                />
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend">{t('Active days of the month')}</FormLabel>
              <FormGroup sx={{flexDirection: "row"}}>
                {monthDays().map((item,key) =>{
                  return <FormControlLabel
                    sx={{width: "50%",margin: "0 0 0 -11px"}}
                    key={key}
                    control={
                      <Checkbox sx={{py:0}} name={`month_days[${item}]`}
                                checked={lengths.month_days.map(i => Number(i)).includes(item)} onChange={onChange}/>
                    }
                    label={item}
                  />
                })}
                <FormControlLabel
                  sx={{width: "50%",margin: "0 0 0 -11px"}}
                  control={
                    <Checkbox sx={{py:0}} name={`month_days_all`}
                              checked={lengths.month_days.length === 31} onChange={onChange}/>
                  }
                  label={t('All')}
                />
              </FormGroup>
            </FormControl>
          </Grid>
        </Grid>
        <ListSubheader component="div" disableSticky sx={{mb:2}}>{t('Date Selection')}</ListSubheader>
        {lengths.spec_dates.map((item,key) => {
          return <Grid container spacing={2} sx={{pb: 2}} key={key}>
            <Grid item xs={12} sm={3}>
              <FormControl size="small" fullWidth className="datePickerFullWidth">
                <DatePicker
                  dateFormat='yyyy-MM-dd'
                  selected={new Date(item.date)} id={`spec_date_${key}`}
                  onSelect={e => {onChange({target: {
                    name:`spec_dates_date[${key}]`,
                    value:Moment(e).format('YYYY-MM-DD')
                  }})}}
                  onChange={e => {onChange({target: {
                    name:`spec_dates_date[${key}]`,
                    value:Moment(e).format('YYYY-MM-DD')
                  }})}}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox name={`spec_dates_active[${key}]`}
                            checked={parseInt(item.active) === 1} onChange={onChange}/>
                }
                label={t('Active')}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <IconButton onClick={e => {
                deleteSpecDate(key)
              }} size="small">
                <DeleteIcon fontSize="small"/>
              </IconButton>
            </Grid>
          </Grid>
        })}
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={4}>
            <IconButton onClick={e => {
              addSpecDate()
            }} size="small">
              <AddCircleIcon fontSize="small"/>
            </IconButton>
          </Grid>
        </Grid>
        <ListSubheader component="div" disableSticky sx={{mb:2}}>{t('Time Selection')}</ListSubheader>
        {lengths.time_intervals.map((item,key) => {
          return <Grid container spacing={2} sx={{pb: 2}} key={key}>
            <Grid item xs={12} sm={3}>
              <FormControl size="small" fullWidth>
                <Select value={item.from} required
                        name={`time_intervals_from[${key}]`}
                        onChange={onChange}>
                  {timeOptions().map((el,k) => {
                    return <MenuItem key={k} value={el}>{el}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1} sx={{textAlign: "center"}}>
              <ArrowForwardIcon fontSize="small"/>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl size="small" fullWidth>
                <Select value={item.to} required
                        name={`time_intervals_to[${key}]`}
                        onChange={onChange}>
                  {timeOptions().map((el,k) => {
                    return <MenuItem key={k} value={el}>{el}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <IconButton onClick={e => {
                deleteTimeIntervals(key)
              }} size="small">
                <DeleteIcon fontSize="small"/>
              </IconButton>
            </Grid>
          </Grid>
        })}
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={4}>
            <IconButton onClick={e => {
              addTimeIntervals()
            }} size="small">
              <AddCircleIcon fontSize="small"/>
            </IconButton>
          </Grid>
        </Grid>
        <ListSubheader component="div" disableSticky sx={{mb:2}}>{t('Booking Seats')}</ListSubheader>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={4}>
            <TextField label={t('Min Seats')} size="small" fullWidth
                       type="number" id="min" name="min" required
                       onChange={onChange} value={lengths.min}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label={t('Max Seats')} size="small" fullWidth
                       type="number" id="max" name="max" required
                       onChange={onChange} value={lengths.max}
            />
          </Grid>
        </Grid>
        <ListSubheader component="div" disableSticky sx={{mb:2}}>{t('Restaurant Areas')}</ListSubheader>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={4}>
            <FormControl component="fieldset" variant="standard">
              <FormGroup>
                {areas.map((item,key) =>{
                  return <FormControlLabel
                    key={key}
                    control={
                      <Checkbox sx={{py:0}} name={`area_ids[${item.id}]`}
                                checked={lengths.area_ids.includes(item.id)} onChange={onChange}/>
                    }
                    label={item.name}
                  />
                })}
              </FormGroup>
            </FormControl>
          </Grid>
        </Grid>
        <ListSubheader component="div" disableSticky sx={{mb:2}}>{t('Translations')}</ListSubheader>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={6}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_languages">{t('Languages')}</InputLabel>
              <Select label={t('Languages')} value={selectedLang}
                      labelId="label_languages" id="languages" name="languages"
                      onChange={onChange}>
                {window.langs.map((el,key) => {
                  return <MenuItem key={key} value={el.lang}>{el.title}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Name')} size="small" fullWidth
                       type="text" id="labels_name" name="labels_name" required
                       onChange={onChange} value={lengths.labels.hasOwnProperty(selectedLang) ? lengths.labels[selectedLang]['name'] : ''}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Description')} size="small" fullWidth multiline rows="3"
                       type="text" id="labels_description" name="labels_description" required
                       onChange={onChange} value={lengths.labels.hasOwnProperty(selectedLang) ? lengths.labels[selectedLang]['description'] : ''}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12}  sm={4}>
            <TextField label={t('Priority')} size="small" fullWidth
                       type="number" id="priority" name="priority" required
                       onChange={onChange} value={lengths.priority}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="outlined" onClick={handleClose}>{t('Cancel')}</Button>
        <Button variant="contained" disabled={loading} onClick={handleSave}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>}
  </>);
};
