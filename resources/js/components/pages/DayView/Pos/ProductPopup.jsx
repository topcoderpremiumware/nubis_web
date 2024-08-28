import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton, InputAdornment, InputLabel, MenuItem, Select,
  TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import eventBus from "../../../../eventBus";
import PictureUploadButtonPreview from "../../../components/PictureUploadButtonPreview";
import axios from "axios";
import Moment from "moment/moment";
import {simpleCatchError} from "../../../../helper";

export default function ProductPopup(props){
  const {t} = useTranslation();
  const [product, setProduct] = useState({})

  useEffect( () => {
    setProduct(props.product)
  }, [props])

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = () => {
    let formData = new FormData()
    formData.append('place_id', localStorage.getItem('place_id'))
    formData.append('name', product.name)
    formData.append('cost_price', product.cost_price)
    formData.append('selling_price', product.selling_price)
    formData.append('stock', product.stock)
    formData.append('tax', product.tax)
    formData.append('product_category_id', product.product_category_id)
    if(product.hasOwnProperty('file')) formData.append('file', product.file)
    axios.post(`${process.env.MIX_API_URL}/api/products${product.hasOwnProperty('id') ? `/${product.id}` : ''}`, formData,{
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      props.onClose()
      eventBus.dispatch("updateProducts")
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
        <>Product</>
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
            <TextField label={t('Name')} size="small" fullWidth sx={{mb: 2}}
                       type="text" id="name" name="name" required
                       onChange={(e) => setProduct(prev => ({...prev, name:e.target.value}))}
                       value={product?.name}
            />
            <TextField label={t('Cost price')} size="small" fullWidth sx={{mb: 2}}
                       type="text" id="cost_price" name="cost_price" required
                       onChange={(e) => setProduct(prev => ({...prev, cost_price:e.target.value}))}
                       value={product?.cost_price}
                       InputProps={{
                         startAdornment: <InputAdornment position="start">{props.currency}</InputAdornment>,
                       }}
            />
            <TextField label={t('Selling price')} size="small" fullWidth sx={{mb: 2}}
                       type="text" id="selling_price" name="selling_price" required
                       onChange={(e) => setProduct(prev => ({...prev, selling_price:e.target.value}))}
                       value={product?.selling_price}
                       InputProps={{
                         startAdornment: <InputAdornment position="start">{props.currency}</InputAdornment>,
                       }}
            />
            <TextField label={t('Stock')} size="small" fullWidth sx={{mb: 2}}
                       type="text" id="stock" name="stock" required
                       onChange={(e) => setProduct(prev => ({...prev, stock:e.target.value}))}
                       value={product?.stock}
            />
            <TextField label={t('Tax')} size="small" fullWidth sx={{mb: 2}}
                       type="text" id="tax" name="tax" required
                       onChange={(e) => setProduct(prev => ({...prev, tax:e.target.value}))}
                       value={product?.tax}
                       InputProps={{
                         endAdornment: <InputAdornment position="end">%</InputAdornment>,
                       }}
            />
            <FormControl size="small" fullWidth sx={{mb: 2}}>
              <InputLabel id="label_product_category_id">{t('Category')}</InputLabel>
              <Select label={t('Category')} value={product?.product_category_id}
                      labelId="label_product_category_id" id="product_category_id" name="product_category_id"
                      onChange={(e) => setProduct(prev => ({...prev, product_category_id:e.target.value}))}>
                {props.categories.map((el,key) => {
                  return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <PictureUploadButtonPreview
              name="image"
              src={product?.image_url || ''}
              onChange={e => setProduct(prev => ({...prev, file:e.target.files[0]}))}/>
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
