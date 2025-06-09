import React, {useEffect, useState} from "react";
import  './Areas.scss';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
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
  IconButton, InputLabel, MenuItem, Select, TextField,
} from "@mui/material";

export default function AreaEditPopup(props) {
  const { t } = useTranslation();
  const [area, setArea] = useState([])
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('i18nextLng'))

  useEffect(() => {
    if(props.area.hasOwnProperty('name')){
      setArea(props.area)
    }
  },[props])

  const onChange = (e) => {
    if(e.target.name === 'name') setArea(prev => ({...prev, name: e.target.value}))
    if(e.target.name === 'online_available') setArea(prev => ({...prev, online_available: e.target.checked ? 1 : 0}))
    if(e.target.name === 'priority') setArea(prev => ({...prev, priority: e.target.value}))
    if(e.target.name === 'languages') setSelectedLang(e.target.value)
    if(e.target.name === 'labels_name'){
      let labels = area.labels || {}
      if(!labels.hasOwnProperty(selectedLang)) labels[selectedLang] = {name: '', description: ''}
      labels[selectedLang]['name'] = e.target.value
      setArea(prev => ({...prev, labels: labels}))
    }
    if(e.target.name === 'labels_description'){
      let labels = area.labels || {}
      if(!labels.hasOwnProperty(selectedLang)) labels[selectedLang] = {name: '', description: ''}
      labels[selectedLang]['description'] = e.target.value
      setArea(prev => ({...prev, labels: labels}))
    }
  }

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = () => {
    props.onChange(area)
  }

  return (<>
    {area.hasOwnProperty('name') &&
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
            <TextField label={t('Name')} size="small" fullWidth
                       type="text" id="name" name="name" required
                       onChange={onChange} value={area.name}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox name="online_available" checked={parseInt(area.online_available) === 1} onChange={onChange}/>}
              label={t('Online available')}
              labelPlacement="end"
            />
          </Grid>
        </Grid>
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
                       onChange={onChange}
                       value={(area.labels && area.labels.hasOwnProperty(selectedLang)) ? area.labels[selectedLang]['name'] : ''}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Description')} size="small" fullWidth multiline rows="3"
                       type="text" id="labels_description" name="labels_description" required
                       onChange={onChange}
                       value={(area.labels && area.labels.hasOwnProperty(selectedLang)) ? area.labels[selectedLang]['description'] : ''}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12}  sm={4}>
            <TextField label={t('Priority')} size="small" fullWidth
                       type="number" id="priority" name="priority" required
                       onWheel={(e) => e.target.blur()}
                       onChange={onChange} value={area.priority}
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
