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

  const handleClose = () => {
    props.onClose()
  }

  const types = [
    {id: 'our_code_amount', title: t('Our gift card')},
    {id: 'code_amount', title: t('Other gift card')},
    {id: 'custom_amount', title: t('Custom amount')},
    {id: 'custom_percent', title: t('Custom percent')}
  ]

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
        {['our_code_amount','code_amount','custom_amount'].includes(props.check.discount_type) &&
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
        {['our_code_amount','code_amount'].includes(props.check.discount_type) &&
        <TextField label={t('Discount code')} size="small" fullWidth sx={{mb: 2}}
                   type="text" id="discount_code" name="discount_code" required
                   onChange={props.onChange}
                   value={props.check.discount_code}
        />}
        {['code_amount'].includes(props.check.discount_type) &&
          <TextField label={t('Discount name')} size="small" fullWidth sx={{mb: 2}}
                     type="text" id="discount_name" name="discount_name" required
                     onChange={props.onChange}
                     value={props.check.discount_name}
          />}
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="contained" onClick={handleClose}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
}
