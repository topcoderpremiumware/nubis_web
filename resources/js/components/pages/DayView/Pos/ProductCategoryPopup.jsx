import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  Autocomplete,
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
import {simpleCatchError} from "../../../../helper";

export default function ProductCategoryPopup(props){
  const {t} = useTranslation();
  const [item, setItem] = useState({})
  const [type, setType] = useState('')

  useEffect( () => {
    if(props.item.hasOwnProperty("id")){
      if(props.item.hasOwnProperty("parent_id")){
        setType('category')
        setItem(props.item)
      }else{
        setType('product')
        let product_category_ids = props.item.product_categories.map(el => el.id)
        setItem(prev => ({...props.item,product_category_ids: product_category_ids}))
      }
    }else{
      setType(props.item.type)
      if(props.item.type === 'product'){
        let product_category_ids = props.item.product_categories.map(el => el.id)
        setItem(prev => ({...props.item,product_category_ids: product_category_ids}))
      }else{
        setItem(props.item)
      }
    }
  }, [props])

  useEffect( () => {
    console.log('item',item)
  }, [item])

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = () => {
    let formData = new FormData()
    formData.append('place_id', localStorage.getItem('place_id'))
    formData.append('name', item.name)
    if(item.hasOwnProperty('file')) formData.append('file', item.file)
    if(type === 'product'){
      formData.append('cost_price', item.cost_price)
      formData.append('selling_price', item.selling_price)
      formData.append('stock', item.stock)
      formData.append('tax', item.tax)
      formData.append('type', item.type)
      if(item.hasOwnProperty('product_category_ids')) formData.append('product_category_ids', item.product_category_ids)
    }
    if(type === 'category'){
      if(item.hasOwnProperty('parent_id') && item.parent_id) formData.append('parent_id', item.parent_id)
    }

    let url = `${process.env.MIX_API_URL}/api/product${type === 'category' ? '_categorie' : ''}s${item.hasOwnProperty('id') ? `/${item.id}` : ''}`
    axios.post(url, formData,{
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      if(type === 'category'){
        eventBus.dispatch("updateCategories",props.currentCategory?.id)
      }else{
        eventBus.dispatch("updateProducts",props.currentCategory?.id)
      }
      props.onClose()
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const selectedCategory = React.useMemo(
    () => props.categories.filter((v) => item?.product_category_ids?.includes(v.id)),
    [props.categories,item.product_category_ids],
  );

  const selectedParent = React.useMemo(
    () => props.categories.find((v) => item?.parent_id === v.id),
    [props.categories,item.parent_id],
  );

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
        <>{type === 'category' ? t('Category') : t('Product')}</>
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
            <FormControl size="small" fullWidth sx={{mb: 2}}>
              <InputLabel id="label_type">{t('Type')}</InputLabel>
              <Select label={t('Type')} value={type}
                      disabled={item.hasOwnProperty('id')}
                      labelId="label_type" id="type" name="type"
                      onChange={(e) => setType(e.target.value)}>
                {[{id:'category',name:t('Category')},{id:'product',name:t('Product')}].map((el,key) => {
                  return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
                })}
              </Select>
            </FormControl>
            <TextField label={t('Name')} size="small" fullWidth sx={{mb: 2}}
                       type="text" id="name" name="name" required
                       onChange={(e) => setItem(prev => ({...prev, name:e.target.value}))}
                       value={item?.name}
            />
            {type === 'product' && <>
              <FormControl size="small" fullWidth sx={{mb: 2}}>
                <InputLabel id="label_product_type">{t('Product type')}</InputLabel>
                <Select label={t('Product type')} value={item?.type}
                        labelId="label_product_type" id="product_type" name="product_type"
                        onChange={(e) => setItem(prev => ({...prev, type:e.target.value}))}>
                  {['drink','food'].map((el,key) => {
                    return <MenuItem key={key} value={el}>{t(el)}</MenuItem>
                  })}
                </Select>
              </FormControl>
              <TextField label={t('Cost price')} size="small" fullWidth sx={{mb: 2}}
                         type="text" id="cost_price" name="cost_price" required
                         onChange={(e) => setItem(prev => ({...prev, cost_price:e.target.value}))}
                         value={item?.cost_price}
                         InputProps={{
                           startAdornment: <InputAdornment position="start">{props.currency}</InputAdornment>,
                         }}
              />
              <TextField label={t('Selling price')} size="small" fullWidth sx={{mb: 2}}
                         type="text" id="selling_price" name="selling_price" required
                         onChange={(e) => setItem(prev => ({...prev, selling_price:e.target.value}))}
                         value={item?.selling_price}
                         InputProps={{
                           startAdornment: <InputAdornment position="start">{props.currency}</InputAdornment>,
                         }}
              />
              <TextField label={t('Stock')} size="small" fullWidth sx={{mb: 2}}
                         type="text" id="stock" name="stock" required
                         onChange={(e) => setItem(prev => ({...prev, stock:e.target.value}))}
                         value={item?.stock}
              />
              <TextField label={t('VAT')} size="small" fullWidth sx={{mb: 2}}
                         type="text" id="tax" name="tax" required
                         onChange={(e) => setItem(prev => ({...prev, tax:e.target.value}))}
                         value={item?.tax}
                         InputProps={{
                           endAdornment: <InputAdornment position="end">%</InputAdornment>,
                         }}
              />
              <Autocomplete sx={{mb: 2}}
                disablePortal
                multiple
                disableClearable
                id="label_product_category_ids"
                options={props.categories}
                renderOption={(props, option) => (
                  <li {...props} style={{paddingLeft: `${8 * option.path.split('.').length}px`}}>{option.label}</li>
                )}
                size="small"
                onChange={(e, newValue) =>
                  setItem(prev => ({...prev, product_category_ids: newValue.map(i => i.id)}))
                }
                renderInput={(params) =>
                  <TextField
                    {...params}
                    label={t('Categories')}
                    placeholder={t('Categories')}
                  />
                }
                value={selectedCategory}
              />
            </>}
            {type === 'category' &&
              <Autocomplete sx={{mb: 2}}
                disablePortal
                disableClearable
                id="label_parent_id"
                options={[
                  {id:null,label:t('Uncategorized'),path:'0.0'},
                  ...props.categories.map(i => (item.hasOwnProperty('id') && (i.path.includes('.'+item.id+'.') || i.path.endsWith('.'+item.id)) ? null : i)).filter(i => i)
                ]}
                renderOption={(props, option) => (
                  <li {...props} style={{paddingLeft: `${8 * option.path.split('.').length}px`}}>{option.label}</li>
                )}
                size="small"
                onChange={(e, newValue) =>
                  setItem(prev => ({...prev, parent_id: newValue.id}))
                }
                renderInput={(params) =>
                  <TextField
                    {...params}
                    label={t('Parent category')}
                    placeholder={t('Parent category')}
                  />
                }
                value={selectedParent}
              />}
          </Grid>
          <Grid item xs={12} sm={6}>
            <PictureUploadButtonPreview
              name="image"
              src={item?.image_url || ''}
              onChange={e => setItem(prev => ({...prev, file:e.target.files[0]}))}/>
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
