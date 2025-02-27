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
import axios from "axios";
import eventBus from "../../../../eventBus";
import {simpleCatchError} from "../../../../helper";
import {qzTrayPrint} from "../../../../qzTray";
import {localPrint} from "../../../../localPrint";
const printFunction = (window.ipcRenderer || window.ReactNativeWebView) ? localPrint : qzTrayPrint;

export default function PrintProductsPopup(props){
  const {t} = useTranslation();
  const [oldCheck, setOldCheck] = useState({})
  const [newCheck, setNewCheck] = useState({})
  const [removeProductType, setRemoveProductType] = useState()

  useEffect(() => {
    if(props.open){
      setRemoveProductType(props.type === 'drink' ? 'food' : 'drink')
    }
  },[props.open,props.check])

  useEffect(() => {
    const deepCloneCheck = structuredClone(props.check);
    setOldCheck({
      ...deepCloneCheck,
      products: deepCloneCheck.products.filter(el => el.type !== removeProductType),
      discount:null,discount_type:null,discount_name:null,discount_code:null})
    setNewCheck({
      place_id: deepCloneCheck.place_id,
      order_id: deepCloneCheck.order_id,
      status: 'open',
      total: 0,
      products: []
    })
  },[removeProductType])

  const handleClose = () => {
    props.onClose()
  }

  const handlePrint = (type) => {
    let check = type === 'all' ? props.check : newCheck
    check.products = check.products.filter(el => el.type !== removeProductType)
    axios.post(`${process.env.MIX_API_URL}/api/checks/${oldCheck.id}/print_products`, {
      products: check.products,
      print_type: type
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      responseType: 'blob'
    }).then(response => {
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      printFunction([props.type === 'drink' ? 'bar' : 'kitchen','all_prints'], pdfBlob, () => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        if(window.ReactNativeWebView){
          window.location.href = pdfUrl;
          window.ReactNativeWebView.postMessage(JSON.stringify({action: 'print_receipt'}));
        }else{
          window.open(pdfUrl, '_blank');
          URL.revokeObjectURL(pdfUrl);
        }
      })

      if(type !== 'all'){
        props.check.products = props.check.products.map(item => check.products.some(el => el.id === item.id) ?
          { ...item, pivot: {...item.pivot, is_printed: 1} }
          : item)
      }
    }).catch(error => {
      simpleCatchError(error)
    })
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
        <>{t('Select products to print')}</>
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
              showPrinted={true}
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
        <Button variant="contained" onClick={() => handlePrint()}>{t('Print selected')}</Button>
        <Button variant="contained" onClick={() => handlePrint('all')}>{t('Print all')}</Button>
      </DialogActions>
    </Dialog>
  );
}
