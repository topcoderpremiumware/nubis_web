import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton, InputLabel, MenuItem, Select
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import axios from "axios";

export default function ChangeTablePopup(props){
  const {t} = useTranslation();
  const [orders, setOrders] = useState([])
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    if(props.check && props.open){
      getOrders()
      setOrderId(props.check.order_id)
    }
  },[props.open])

  const handleClose = () => {
    props.onClose()
  }

  const getOrders = async (category_id = false) => {
    await axios.get(`${process.env.MIX_API_URL}/api/orders/${props.check.order_id}/neighbors`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setOrders(prev => ([...response.data]))
    }).catch(error => {
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
        <>{t('Change cart table')}</>
        <IconButton onClick={props.onClose} sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {orders.length > 0 ?
        <FormControl size="small" fullWidth sx={{mb: 2}}>
          <InputLabel id="label_order">{t('Order (tables)')}</InputLabel>
          <Select label={t('Order (tables)')} value={orderId}
                  labelId="label_order" id="order" name="order"
                  onChange={(e) => setOrderId(e.target.value)}>
            {orders.map((el,key) => {
              return <MenuItem key={key} value={el.id}>#{el.id} ({el.table_ids.join(', ')})</MenuItem>
            })}
          </Select>
        </FormControl>
          :
          <>{t('There are no other ordered tables')}</>
        }
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="contained" onClick={() => props.onChange(orderId)}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
}
