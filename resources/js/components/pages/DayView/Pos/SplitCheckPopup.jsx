import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton, Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import CheckTable from "./CheckTable";
import Box from "@mui/material/Box";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import {calcCheckTotal} from "./posHelper";

export default function SplitCheckPopup(props){
  const {t} = useTranslation();
  const [oldCheck, setOldCheck] = useState({})
  const [newCheck, setNewCheck] = useState({})

  useEffect(() => {
    const deepCloneCheck = structuredClone(props.check);
    setOldCheck({...deepCloneCheck,discount:null,discount_type:null,discount_name:null,discount_code:null})
    setNewCheck({
      place_id: deepCloneCheck.place_id,
      order_id: deepCloneCheck.order_id,
      status: 'open',
      total: 0,
      products: []
    })
  },[props])

  const handleClose = () => {
    props.onClose()
  }

  const handleSave = () => {
    props.onChange(oldCheck,newCheck)
  }

  const moveToNew = (product, quantity) => {
    let tempOldCheck = oldCheck
    let tempNewCheck = newCheck
    let oldProdIndex = tempOldCheck.products.findIndex((el) => el.id === product.id)
    let newProdIndex = tempNewCheck.products.findIndex((el) => el.id === product.id)

    tempOldCheck.products[oldProdIndex].pivot.quantity -= quantity
    if(tempOldCheck.products[oldProdIndex].pivot.quantity === 0){
      tempOldCheck.products.splice(oldProdIndex,1)
    }

    if (newProdIndex === -1) {
      newProdIndex = tempNewCheck.products.length
      tempNewCheck.products.push({...product, pivot:{...product.pivot, quantity: 0}})
    }
    tempNewCheck.products[newProdIndex].pivot.quantity += quantity

    let totals = calcCheckTotal(tempOldCheck)
    tempOldCheck.total = totals['total']
    tempOldCheck.subtotal = totals['subtotal']

    totals = calcCheckTotal(tempNewCheck)
    tempNewCheck.total = totals['total']
    tempNewCheck.subtotal = totals['subtotal']

    setOldCheck(prev => ({...tempOldCheck}))
    setNewCheck(prev => ({...tempNewCheck}))
  }

  const moveToOld = (product, quantity) => {
    let tempOldCheck = oldCheck
    let tempNewCheck = newCheck
    let oldProdIndex = tempOldCheck.products.findIndex((el) => el.id === product.id)
    let newProdIndex = tempNewCheck.products.findIndex((el) => el.id === product.id)

    tempNewCheck.products[newProdIndex].pivot.quantity -= quantity
    if(tempNewCheck.products[newProdIndex].pivot.quantity === 0){
      tempNewCheck.products.splice(newProdIndex,1)
    }

    if (oldProdIndex === -1) {
      oldProdIndex = tempOldCheck.products.length
      tempOldCheck.products.push({...product, pivot:{...product.pivot, quantity: 0}})
    }
    tempOldCheck.products[oldProdIndex].pivot.quantity += quantity

    let totals = calcCheckTotal(tempNewCheck)
    tempNewCheck.total = totals['total']
    tempNewCheck.subtotal = totals['subtotal']

    totals = calcCheckTotal(tempOldCheck)
    tempOldCheck.total = totals['total']
    tempOldCheck.subtotal = totals['subtotal']

    setOldCheck(prev => ({...tempOldCheck}))
    setNewCheck(prev => ({...tempNewCheck}))
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
        <>{t('Splitting the cart in half')}</>
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
            <CheckTable
              check={oldCheck}
              quantityButtons={(product) => <Stack spacing={0} direction="row" alignItems="center">
                <Box>{product.pivot.quantity}</Box>
                <IconButton onClick={() => moveToNew(product,1)}>
                  <KeyboardArrowRightIcon/>
                </IconButton>
                <IconButton onClick={() => moveToNew(product,product.pivot.quantity)}>
                  <KeyboardDoubleArrowRightIcon/>
                </IconButton>
              </Stack>}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CheckTable
              check={newCheck}
              quantityButtons={(product) => <Stack spacing={0} direction="row" alignItems="center">
                <IconButton onClick={() => moveToOld(product,product.pivot.quantity)}>
                  <KeyboardDoubleArrowLeftIcon/>
                </IconButton>
                <IconButton onClick={() => moveToOld(product,1)}>
                  <KeyboardArrowLeftIcon/>
                </IconButton>
                <Box>{product.pivot.quantity}</Box>
              </Stack>}
            />
          </Grid>
        </Grid>
        {props.children}
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="contained" onClick={handleSave}>{t('Apply')}</Button>
      </DialogActions>
    </Dialog>
  );
}
