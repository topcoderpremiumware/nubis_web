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

export default function DiscountPopup(props){
  const {t} = useTranslation();
  const [cardInfo, setCardInfo] = useState(null)

  const handleClose = () => {
    props.onClose()
    setCardInfo(null)
  }

  const types = [
    {id: 'our_code_amount', title: t('Our gift card')},
    {id: 'code_amount', title: t('Other gift card')},
    {id: 'custom_amount', title: t('Custom amount')},
    {id: 'custom_percent', title: t('Custom percent')}
  ]

  const checkCard = async () => {
    setCardInfo(null)
    axios.get(`${process.env.MIX_API_URL}/api/giftcards_check`, {
      params: {
        code: props.check.discount_code,
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setCardInfo(response.data)
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const onSpend = async () => {
    await axios.post(`${process.env.MIX_API_URL}/api/giftcards_spend`, {
      code: props.check.discount_code,
      amount: props.check.discount
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      handleClose()
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  return (
    <Dialog onClose={props.onClose} open={props.open} fullWidth maxWidth="sm"
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
        <>{t('Discount')}</>
        <IconButton onClick={props.onClose} sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <FormControl size="small" fullWidth sx={{mb: 2}}>
          <InputLabel id="label_discount_type">{t('Discount type')}</InputLabel>
          <Select label={t('Discount type')} value={props.check.discount_type}
                  labelId="label_discount_type" id="discount_type" name="discount_type"
                  onChange={props.onChange}>
            {types.map((el,key) => {
              return <MenuItem key={key} value={el.id}>{el.title}</MenuItem>
            })}
          </Select>
        </FormControl>
        {['code_amount'].includes(props.check.discount_type) &&
          <TextField label={t('Discount code')} size="small" fullWidth sx={{mb: 2}}
                     type="text" id="discount_code" name="discount_code" required
                     onChange={props.onChange}
                     value={props.check.discount_code}
          />}
        {['our_code_amount'].includes(props.check.discount_type) && <>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField label={t('Discount code')} size="small" fullWidth sx={{mb: 2}}
                         type="text" id="discount_code" name="discount_code" required
                         onChange={props.onChange}
                         value={props.check.discount_code}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                type="button"
                onClick={checkCard}
              >{t('Check')}</Button>
            </Grid>
          </Grid>
          {cardInfo && <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <p><b>{t('Name')}:</b> {cardInfo.name || '-'}</p>
                <p><b>{t('Email')}:</b> {cardInfo.email || '-'}</p>
                <p><b>{t('Initail Amount')}:</b> {cardInfo.initial_amount} {props.currency}</p>
                {cardInfo.giftcard_menu_id && <>
                  <p><b>{t('Experience')}:</b> {cardInfo.giftcard_menu.name}</p>
                </>}
              </Grid>
              <Grid item xs={12} sm={6}>
                <p><b>{t('Receiver Name')}:</b> {cardInfo.receiver_name || '-'}</p>
                <p><b>{t('Receiver Email')}:</b> {cardInfo.receiver_email || '-'}</p>
                <p><b>{t('Spend Amount')}:</b> {cardInfo.spend_amount} {props.currency}</p>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{mt:3}}>
              <Grid item xs={12} sm={8}>
                <TextField label={t('Discount amount')} size="small" fullWidth sx={{ mb: 2 }}
                           type="text" id="discount" name="discount" required
                           value={props.check.discount}
                           onChange={props.onChange}
                           InputProps={{
                             startAdornment: <InputAdornment position="start">{props.currency}</InputAdornment>,
                           }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  type="button"
                  onClick={onSpend}
                >{t('Spend')}</Button>
              </Grid>
            </Grid>
          </>}
        </>}
        {['code_amount'].includes(props.check.discount_type) &&
          <TextField label={t('Discount name')} size="small" fullWidth sx={{mb: 2}}
                     type="text" id="discount_name" name="discount_name" required
                     onChange={props.onChange}
                     value={props.check.discount_name}
          />}
        {['code_amount','custom_amount'].includes(props.check.discount_type) &&
        <TextField label={t('Discount amount')} size="small" fullWidth sx={{mb: 2}}
                   type="text" id="discount" name="discount" required
                   onChange={props.onChange}
                   value={props.check.discount}
                   InputProps={{
                     startAdornment: <InputAdornment position="start">{props.currency}</InputAdornment>,
                   }}
        />}
        {['custom_percent'].includes(props.check.discount_type) &&
        <TextField label={t('Discount percent')} size="small" fullWidth sx={{mb: 2}}
                   type="text" id="discount" name="discount" required
                   onChange={props.onChange}
                   value={props.check.discount}
                   InputProps={{
                     endAdornment: <InputAdornment position="end">%</InputAdornment>,
                   }}
        />}
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="contained" onClick={handleClose}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
}
