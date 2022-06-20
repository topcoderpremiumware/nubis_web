import React, {useEffect, useState} from "react";
import  './TablePlanSetup.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import CloseIcon from '@mui/icons-material/Close';
import { ColorPicker } from 'material-ui-color';
import EditIcon from '@mui/icons-material/Edit'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from "@mui/material";

export default function TablePropertiesPopup(props) {
  const { t } = useTranslation();
  const [table, setTable] = useState({})
  const [numbers, setNumbers] = useState([])
  const [numberError, setNumberError] = useState([])
  const [copy, setCopy] = useState(true)
  const [focusOn, setFocusOn] = useState('')
  const [editRow, setEditRow] = useState(0)

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
    setNumbers(props.numbers)
    setTable(props.table)
  },[props])

  const onChange = (e) => {
    if(e.target.name === 'copy') setCopy(e.target.checked)
    if(e.target.name === 'number') setTable(prev => ({...prev, data: {
      ...prev.data,
        number: parseInt(e.target.value) || ''
    }}))
    if(e.target.name === 'angle') setTable(prev => ({...prev, data: {
      ...prev.data,
        angle: e.target.value
    }}))
    if(e.target.name === 'color') setTable(prev => ({...prev, data: {
      ...prev.data,
        color: e.target.value
    }}))
    if(e.target.name === 'note') setTable(prev => ({...prev, data: {
        ...prev.data,
        note: parseInt(e.target.value) || ''
      }}))
    setFocusOn(e.target.name)
  }

  const onTimeChange = (e, key) => {
    let time = table.data.time
    let lastKey = copy ? time.length-1 : key
    for(var i=key;i<=lastKey;i++) {
      if (e.target.name === 'is_internal') time[i].is_internal = e.target.checked
      if (e.target.name === 'is_online') time[i].is_online = e.target.checked
      if (e.target.name === 'priority') time[i].priority = intWrapper(e.target.value)
      if (e.target.name === 'min_seats') time[i].min_seats = intWrapper(e.target.value)
      if (e.target.name === 'group') time[i].group = intWrapper(e.target.value)
      if (e.target.name === 'booking_length') time[i].booking_length = intWrapper(e.target.value)
      if (e.target.name === 'group_priority') time[i].group_priority = intWrapper(e.target.value)
    }
    setTable(prev => ({...prev, data: {
        ...prev.data,
        time: time
      }}))
    setFocusOn(e.target.name+'_'+key)
  }

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = () => {
    setNumberError([])
    if(numbers.includes(table.data.number)){
      return setNumberError(['This number is used'])
    }
    if(table.data.number === ''){
      return setNumberError(['This field is empty'])
    }
    props.onChange(table.id,table.data)
  }

  const tableTime = (key) => {
    var tt = new Date(0);
    tt = new Date(tt.getTime() + key*15*60000)
    return (tt.getUTCHours()<10?'0':'')+tt.getUTCHours()+':'+(tt.getMinutes()<10?'0':'')+tt.getMinutes()
  }

  const bookingOptions = () => {
    var length = []
    for(var i=0;i<=1500;i+=15) length.push(i)
    return length
  }

  const intWrapper = (val) => {
    return isNaN(parseInt(val)) ? '' : parseInt(val)
  }

  return (<>
    {table.hasOwnProperty('data') &&
    <Dialog onClose={handleClose} open={props.open} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {table.data.type.startsWith('land') ? t('Element properties') : t('Table properties')}
        <IconButton onClick={handleClose} sx={{
          position:'absolute',
          right:8,
          top:8,
          color:(theme) => theme.palette.grey[500],
          }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{pb: 2}}>
          {!table.data.type.startsWith('land') && <><Grid item sm={4}>
            <TextField label={t('Number')} size="small" fullWidth
                       type="number" id="number" name="number" required
                       onChange={onChange} value={table.data.number}
                       error={numberError.length > 0}
                       helperText={
                         <>{numberError.map(el => {return t(el)})}</>
                       }/>
          </Grid>
          <Grid item sm={4}>
            <FormControlLabel label={t('Color')} labelPlacement="start"
                              control={
              <ColorPicker id="color" name="color"
                value={table.data.color}
                hideTextfield
                disableAlpha
                inputFormats={['hex']}
                disablePlainColor
                onChange={e => {onChange({target:{name:'color',value:'#'+e.hex}})}}
              />}/>
          </Grid></>}
          <Grid item sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_angle">{t('Angle')}</InputLabel>
              <Select label={t('Angle')} value={table.data.angle}
                      labelId="label_angle" id="angle" name="angle"
                      onChange={onChange}>
                {[0,45,90,135,180,225,270,315].map((el,key) => {
                  return <MenuItem key={key} value={el}>{el}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {table.data.type.startsWith('land') ?
          <TextField label={t('Note')} size="small" fullWidth
                     type="text" id="note" name="note"
                     onChange={onChange} value={table.data.note}
                     multiline rows="3"/>
          :
          <Table>
          <TableHead>
            <TableRow>
              <TableCell size="small"></TableCell>
              <TableCell size="small">{t('Time')}</TableCell>
              <TableCell size="small">{t('Internal')}</TableCell>
              <TableCell size="small">{t('Online')}</TableCell>
              <TableCell size="small">{t('Priority')}</TableCell>
              <TableCell size="small">{t('Available')}</TableCell>
              <TableCell size="small">{t('Group')}</TableCell>
              <TableCell size="small" style={{width:'140px'}}>{t('Booking length')}</TableCell>
              <TableCell size="small">{t('Group priority')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {table.data.time.map((time,key) => {
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
                    <Checkbox id={`is_internal_${key}`} sx={{py: 0}} size="small" name="is_internal"
                              checked={time.is_internal} onChange={e => {onTimeChange(e, key)}}/>
                    :
                    <>{time.is_internal ? 'yes' : 'no'}</>
                  }
                </TableCell>
                <TableCell size="small">
                  {key === editRow ?
                  <Checkbox id={`is_online_${key}`} sx={{py:0}} size="small" name="is_online"
                            checked={time.is_online} onChange={e => {onTimeChange(e,key)}}/>
                    :
                    <>{time.is_online ? 'yes' : 'no'}</>
                  }
                </TableCell>
                <TableCell size="small">
                  {key === editRow ?
                  <TextField id={`priority_${key}`} type="text" name="priority" size="small" fullWidth
                             variant="standard" autoFocus={focusOn === `priority_${key}`}
                             value={intWrapper(time.priority)} onChange={e => {onTimeChange(e,key)}}/>
                    :
                    <>{time.priority}</>
                  }
                </TableCell>
                <TableCell size="small">
                  {key === editRow ?
                  <TextField id={`min_seats_${key}`} type="text" name="min_seats" size="small" fullWidth
                             variant="standard" autoFocus={focusOn === `min_seats_${key}`}
                             value={intWrapper(time.min_seats)} onChange={e => {onTimeChange(e,key)}}/>
                    :
                    <>{time.min_seats}</>
                  }
                </TableCell>
                <TableCell size="small">
                  {key === editRow ?
                  <TextField id={`group_${key}`} type="text" name="group" size="small" fullWidth
                             variant="standard" autoFocus={focusOn === `group_${key}`}
                             value={intWrapper(time.group)} onChange={e => {onTimeChange(e,key)}}/>
                    :
                    <>{time.group}</>
                  }
                </TableCell>
                <TableCell size="small">
                  {key === editRow ?
                  <Select value={intWrapper(time.booking_length)} size="small" variant="standard" fullWidth
                          id={`booking_length_${key}`} name="booking_length"
                          onChange={e => {onTimeChange(e,key)}}>
                    {bookingOptions().map((el,key) => {
                      return <MenuItem key={key} value={el}>{el}</MenuItem>
                    })}
                  </Select>
                    :
                    <>{time.booking_length}</>
                  }
                </TableCell>
                <TableCell size="small">
                  {key === editRow ?
                  <TextField id={`group_priority_${key}`} type="text" name="group_priority" size="small" fullWidth
                             variant="standard" autoFocus={focusOn === `group_priority_${key}`}
                             value={intWrapper(time.group_priority)} onChange={e => {onTimeChange(e,key)}}/>
                    :
                    <>{time.group_priority}</>
                  }
                </TableCell>
              </StyledTableRow>
            })}
          </TableBody>
        </Table>}
      </DialogContent>
      <DialogActions sx={{p:2}}>
        {!table.data.type.startsWith('land') && <FormControlLabel sx={{mr:'auto'}}
          control={<Checkbox name="copy" checked={copy} onChange={onChange}/>}
          label={t('Copy values down')}
          labelPlacement="end"
        />}
        <Button variant="outlined" onClick={handleClose}>{t('Cancel')}</Button>
        <Button variant="contained" onClick={handleSave}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>}
    </>);
};
