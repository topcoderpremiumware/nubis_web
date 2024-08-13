import React, {useEffect, useState} from "react";
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
  FormControlLabel, FormGroup, FormLabel,
  Grid,
  IconButton, InputLabel, MenuItem, Select, TextField,
} from "@mui/material";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import ListSubheader from "@mui/material/ListSubheader";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PictureUploadButton from "../../../components/PictureUploadButton";
import Box from '@mui/material/Box';

export default function ExperienceEditPopup(props) {
  const { t } = useTranslation();
  const [menu, setMenu] = useState({})
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('i18nextLng'))
  const [img, setImg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if(props.menu.hasOwnProperty('name')){
      setMenu(props.menu)
      setImg(props.menu.image_url)
    }
  },[props])

  const onChange = (e) => {
    if(e.target.name === 'image') {
      const file = e.target.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        setImg(reader.result)
        setMenu(prev => ({ ...prev, image: file }))
      };
    }
    if(e.target.name === 'name') setMenu(prev => ({...prev, name: e.target.value}))
    if(e.target.name === 'price') setMenu(prev => ({...prev, price: e.target.value}))
    if(e.target.name === 'active') setMenu(prev => ({...prev, active: e.target.checked ? 1 : 0}))
    if(e.target.name === 'languages') setSelectedLang(e.target.value)
    if(e.target.name === 'labels_name'){
      let labels = menu.labels
      if(!labels.hasOwnProperty(selectedLang)) labels[selectedLang] = {name: '', description: ''}
      labels[selectedLang]['name'] = e.target.value
      setMenu(prev => ({...prev, labels: labels}))
    }
    if(e.target.name === 'labels_description'){
      let labels = menu.labels
      if(!labels.hasOwnProperty(selectedLang)) labels[selectedLang] = {name: '', description: ''}
      labels[selectedLang]['description'] = e.target.value
      setMenu(prev => ({...prev, labels: labels}))
    }
  }

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = async () => {
    setLoading(true)
    let result = await props.onChange(menu)
    setLoading(false)
  }

  const removeImage = () => {
    setImg('')
    setMenu(prev => ({...prev, remove_image: true}))
  }

  return (<>
    {menu.hasOwnProperty('name') &&
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
          <Box sx={{mt:3}}>
            <img src={img} alt="image" width={200} height={'auto'} />
            <IconButton onClick={e => {removeImage()}} size="small">
              <DeleteIcon fontSize="small"/>
            </IconButton>
          </Box>
        }
        <ListSubheader component="div" disableSticky sx={{mb:2}}>{t('General Info')}</ListSubheader>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={4}>
            <TextField label={t('Name')} size="small" fullWidth
                       type="text" id="name" name="name" required
                       onChange={onChange} value={menu.name}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label={t('Price')} size="small" fullWidth
                       type="text" id="price" name="price" required
                       onChange={onChange} value={menu.price}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox name="active" checked={parseInt(menu.active) === 1} onChange={onChange}/>}
              label={t('Active')}
              labelPlacement="end"
            />
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
                       onChange={onChange} value={menu.labels.hasOwnProperty(selectedLang) ? menu.labels[selectedLang]['name'] : ''}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Description')} size="small" fullWidth multiline rows="3"
                       type="text" id="labels_description" name="labels_description" required
                       onChange={onChange} value={menu.labels.hasOwnProperty(selectedLang) ? menu.labels[selectedLang]['description'] : ''}
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
