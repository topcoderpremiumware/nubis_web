import './Pos.scss'
import {useTranslation} from "react-i18next";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, TextField} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import eventBus from "../../../../eventBus";
import PictureUploadButtonPreview from "../../../components/PictureUploadButtonPreview";
import axios from "axios";
import Moment from "moment/moment";
import {simpleCatchError} from "../../../../helper";

export default function CategoryPopup(props){
  const {t} = useTranslation();
  const [category, setCategory] = useState({})

  useEffect( () => {
    setCategory(props.category)
  }, [props])

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = () => {
    let formData = new FormData()
    formData.append('place_id', localStorage.getItem('place_id'))
    formData.append('name', category.name)
    if(category.hasOwnProperty('file')) formData.append('file', category.file)
    axios.post(`${process.env.MIX_API_URL}/api/product_categories${category.hasOwnProperty('id') ? `/${category.id}` : ''}`, formData,{
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("updateCategories")
      props.onClose()
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  return (
    <Dialog onClose={props.onClose} open={props.open} fullWidth maxWidth="md"
            scroll="paper"
            PaperProps={{
              style: {
                backgroundColor: "#F2F3F9",
                margin: 0,
                width: '100%'
              },
            }}
    >
      <DialogTitle sx={{m: 0, p: 2}}>
        <>Category</>
        <IconButton onClick={props.onClose} sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Name')} size="small" fullWidth
                       type="text" id="name" name="name" required
                       onChange={(e) => setCategory(prev => ({...prev, name:e.target.value}))}
                       value={category?.name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <PictureUploadButtonPreview
              name="image"
              src={category?.image_url || ''}
              onChange={e => setCategory(prev => ({...prev, file:e.target.files[0]}))}/>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="outlined" onClick={handleClose}>{t('Cancel')}</Button>
        <Button variant="contained" onClick={handleSave}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
}
