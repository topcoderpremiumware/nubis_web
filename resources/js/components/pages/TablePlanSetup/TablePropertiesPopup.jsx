import React, {useEffect, useState} from "react";
import  './TablePlanSetup.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import CloseIcon from '@mui/icons-material/Close';

import {
  Button, Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControl,
  FormControlLabel,
  Grid,
  IconButton, InputLabel, MenuItem, Select, TextField
} from "@mui/material";

export default function TablePropertiesPopup(props) {
  const { t } = useTranslation();
  const [table, setTable] = useState({})
  const [numbers, setNumbers] = useState([])
  const [numberError, setNumberError] = useState([])

  useEffect(() => {
    console.log('POPUP props',props.table)
    setNumbers(props.numbers)
    setTable(props.table)
  },[props])

  const onChange = (e) => {
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

  return (<>
    {table.hasOwnProperty('data') &&
    <Dialog onClose={handleClose} open={props.open} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {t('Table properties')}
        <IconButton onClick={handleClose} sx={{
          position:'absolute',
          right:8,
          top:8,
          color:(theme) => theme.palette.grey[500],
          }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item sm={4}>
            <TextField label={t('Number')} size="small" fullWidth
                       type="number" id="number" name="number" required
                       onChange={onChange} value={table.data.number}
                       error={numberError.length > 0}
                       helperText={
                         <>{numberError.map(el => {return t(el)})}</>
                       }/>
          </Grid>
          <Grid item sm={4}>

          </Grid>
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
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <FormControlLabel sx={{mr:'auto'}}
          control={<Checkbox />}
          label={t('Copy values down')}
          labelPlacement="end"
        />
        <Button variant="outlined" onClick={handleClose}>{t('Cancel')}</Button>
        <Button variant="contained" onClick={handleSave}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>}
    </>);
};
