import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary, Button,
  CircularProgress,
  IconButton, InputAdornment,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow, TextField,
} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import axios from "axios";
import eventBus from "../../../../eventBus";
import Box from "@mui/material/Box";
import NumberButtons from "../../../components/NumberButtons";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import {simpleCatchError} from "../../../../helper";
import ProductCategoryPopup from "./ProductCategoryPopup";
import DiscountPopup from "./DiscountPopup";

export default function PosCart(props){
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false)
  const [checks, setChecks] = useState([])
  const [selectedCheckIndex, setSelectedCheckIndex] = useState(null)
  const [discountsOpen, setDiscountsOpen] = useState(false)

  const checksRef = useRef(checks);
  const selectedCheckIndexRef = useRef(selectedCheckIndex);

  const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  useEffect( () => {
    function init(){
      getChecks()
    }
    init()
    function handlePlaceChanged(){
      init()
    }
    function handleAddProductToCart(product){
      let tempChecks = checksRef.current
      if(tempChecks.length === 0){
        tempChecks.push({
          place_id: localStorage.getItem('place_id'),
          order_id: props.orderId,
          status: 'open',
          total: product.selling_price,
          products: [{...product, pivot:{price: product.selling_price, quantity: 1}}]
        })
        setSelectedCheckIndex(0)
      }else {
        if(tempChecks[selectedCheckIndexRef.current].status === 'closed'){
          eventBus.dispatch("notification", {type: 'error', message: 'Cart is closed'});
          return
        }
        let index = tempChecks[selectedCheckIndexRef.current].products.findIndex(e => e.id === product.id)
        if (index === -1) {
          tempChecks[selectedCheckIndexRef.current].products.push({...product, pivot:{price: product.selling_price, quantity: 1}})
        } else {
          product = tempChecks[selectedCheckIndexRef.current].products[index]
          tempChecks[selectedCheckIndexRef.current].products[index] = {
            ...product,
            pivot:{
              ...product.pivot,
              quantity: product.pivot.quantity + 1
            }
          }
        }
        let totals = calcCheckTotal(tempChecks[selectedCheckIndexRef.current])
        tempChecks[selectedCheckIndexRef.current].total = totals['total']
        tempChecks[selectedCheckIndexRef.current].subtotal = totals['subtotal']
      }
      setChecks(prev => ([...tempChecks]))
    }
    function handleRemoveProductToCart(product){
      let tempChecks = checksRef.current
      if(tempChecks[selectedCheckIndexRef.current].status === 'closed'){
        eventBus.dispatch("notification", {type: 'error', message: 'Cart is closed'});
        return
      }
      let index = tempChecks[selectedCheckIndexRef.current].products.findIndex(e => e.id === product.id)
      product = tempChecks[selectedCheckIndexRef.current].products[index]
      if(product.pivot.quantity > 1){
        tempChecks[selectedCheckIndexRef.current].products[index] = {
          ...product,
          pivot:{
            ...product.pivot,
            quantity: product.pivot.quantity - 1
          }
        }
      }else{
        tempChecks[selectedCheckIndexRef.current].products.splice(index, 1)
      }
      let totals = calcCheckTotal(tempChecks[selectedCheckIndexRef.current])
      tempChecks[selectedCheckIndexRef.current].total = totals['total']
      tempChecks[selectedCheckIndexRef.current].subtotal = totals['subtotal']
      setChecks(prev => ([...tempChecks]))
    }
    eventBus.on("addProductToCart", handleAddProductToCart)
    eventBus.on("removeProductToCart", handleRemoveProductToCart)
    eventBus.on("placeChanged", handlePlaceChanged)
    return () => {
      eventBus.remove("addProductToCart", handleAddProductToCart)
      eventBus.remove("removeProductToCart", handleRemoveProductToCart)
      eventBus.remove("placeChanged", handlePlaceChanged)
    }
  }, [props.orderId])

  useEffect(() => {
    checksRef.current = checks;
  },[checks])

  useEffect(() => {
    selectedCheckIndexRef.current = selectedCheckIndex;
  },[selectedCheckIndex])

  const calcCheckTotal = (check) => {
    let subtotal = check.products.reduce(
      (acc, product) => acc + product.pivot.quantity * product.pivot.price,
      0
    )
    let total = subtotal
    if(check.discount_type){
      if(check.discount_type.includes('amount')){
        total -= check.discount
      }else if(check.discount_type.includes('percent')){
        total -= total * check.discount / 100
      }
    }
    return {total: parseFloat(total?.toFixed(2)),subtotal: parseFloat(subtotal?.toFixed(2))}
  }

  const getChecks = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/orders/${props.orderId}/checks`).then(response => {
      setChecks(prev => ([...response.data]))
      if(response.data.length > 0) setSelectedCheckIndex(0)
      setLoading(false)
    }).catch(error => {
    })
  }

  const saveCheck = () => {
    let check = checks[selectedCheckIndex]
    let url = `${process.env.MIX_API_URL}/api/checks`
    if(check.hasOwnProperty('id')){
      url = `${process.env.MIX_API_URL}/api/checks/${check.id}`
    }

    axios.post(url, check,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      if(!check.hasOwnProperty('id')){
        let tempChecks = checks
        tempChecks[selectedCheckIndex].id = response.data.id
        setChecks(prev => ([...tempChecks]))
      }
      eventBus.dispatch("notification", {type: 'success', message: 'Cart saved successfully'});
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const addCart = () => {
    setChecks(prev => ([...prev,{
      place_id: localStorage.getItem('place_id'),
      order_id: props.orderId,
      status: 'open',
      total: 0,
      products: []
    }]))
    setSelectedCheckIndex(checks.length)
  }

  const onChangeDiscount = (e) => {
    let tempChecks = checks
    if(e.target.name === 'discount'){
      if(tempChecks[selectedCheckIndex].discount_type.includes('percent') && e.target.value > 100){
        return false
      }else if(tempChecks[selectedCheckIndex].discount_type.includes('amount') && e.target.value > tempChecks[selectedCheckIndex].subtotal) {
        return false
      }
      tempChecks[selectedCheckIndex].discount = e.target.value
    }
    if(e.target.name === 'discount_type'){
      tempChecks[selectedCheckIndex].discount_type = e.target.value
      tempChecks[selectedCheckIndex].discount_code = null
      tempChecks[selectedCheckIndex].discount_name = null
      tempChecks[selectedCheckIndex].discount = null
    }
    if(e.target.name === 'discount_code') tempChecks[selectedCheckIndex].discount_code = e.target.value
    if(e.target.name === 'discount_name') tempChecks[selectedCheckIndex].discount_name = e.target.value
    if(e.target.name === 'name') tempChecks[selectedCheckIndex].name = e.target.value
    let totals = calcCheckTotal(tempChecks[selectedCheckIndex])
    tempChecks[selectedCheckIndex].total = totals['total']
    tempChecks[selectedCheckIndex].subtotal = totals['subtotal']
    setChecks(prev => ([...tempChecks]))
  }

  const openPDF = () => {
    axios.post(`${process.env.MIX_API_URL}/api/checks/${checks[selectedCheckIndex].id}/print`,{}, {
      responseType: 'blob'
    }).then(response => {
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      URL.revokeObjectURL(pdfUrl);

      let tempChecks = checks
      tempChecks[selectedCheckIndex].status = 'closed'
      setChecks(prev => ([...tempChecks]))
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  return (<>
    <Stack spacing={2} mb={2} direction="row" alignItems="center">
      <h5>{t('Shopping cart')}</h5>
      <span style={{marginLeft: 'auto'}}></span>
      <IconButton onClick={e => {addCart()}}>
        <AddShoppingCartIcon/>
      </IconButton>
    </Stack>
    {loading ? <div><CircularProgress/></div> :
    <Box style={{height: 'calc(100svh - 155px)',overflowY: 'auto'}}>
      {checks.length > 0 ?
        <>{checks.map((check, key) => {
          return <Accordion key={key} expanded={selectedCheckIndex === key}
                            onChange={() => setSelectedCheckIndex(key)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon/>}
              aria-controls={`check${key}-content`}
              className={`check_${check.status}`}
              id={`check${key}-header`}>
              <Box style={{display: 'flex', alignItems: 'center'}}>{t('Cart')} #{key}
                {(check.status !== 'closed' && selectedCheckIndex === key) ?
                  <TextField label={t('Title')} size="small" sx={{ml: 1}}
                             type="text" id="name" name="name"
                             onChange={onChangeDiscount}
                             value={check.name}
                  /> : <> {check.name}</>}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{p: 0}}>
              <TableContainer>
                <Table>
                  <TableBody>
                    {check.products.map((product, key) => {
                      return <StyledTableRow key={key}>
                        <TableCell size="small"><NumberButtons
                          value={product.pivot.quantity}
                          onAdd={e => eventBus.dispatch('addProductToCart',product)}
                          onRemove={e => eventBus.dispatch('removeProductToCart',product)}/></TableCell>
                        <TableCell size="small" style={{width: '100%'}}>{product.name}</TableCell>
                        <TableCell size="small" align="right">{(product.pivot.price*product.pivot.quantity)?.toFixed(2)}</TableCell>
                      </StyledTableRow>
                    })}
                    <StyledTableRow>
                      <TableCell size="small"></TableCell>
                      <TableCell size="small">{t('Subtotal')}</TableCell>
                      <TableCell size="small" align="right">{check.subtotal?.toFixed(2)}</TableCell>
                    </StyledTableRow>
                    {check.discount &&
                    <StyledTableRow>
                      <TableCell size="small"></TableCell>
                      <TableCell size="small">{t('Discount')}</TableCell>
                      <TableCell size="small" align="right">
                        {parseFloat(check.discount)?.toFixed(2)}{check.discount_type.includes('percent') ? '%' : ''}
                      </TableCell>
                    </StyledTableRow>}
                    <StyledTableRow>
                      <TableCell size="small"></TableCell>
                      <TableCell size="small"><b>{t('Total')}</b></TableCell>
                      <TableCell size="small" align="right"><b>{check.total?.toFixed(2)}</b></TableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        })}
          <Stack spacing={2} sx={{mt: 2}} direction="row">
            <Button variant="contained" type="button" disabled={checks[selectedCheckIndex].status === 'closed'} onClick={e => setDiscountsOpen(true)}>{t('Discounts')}</Button>
            <Button variant="contained" type="button" disabled={loading} onClick={saveCheck}>{t('Save')}</Button>
            <Button variant="contained" type="button" disabled={!checks[selectedCheckIndex].hasOwnProperty('id')} onClick={openPDF}>{t('Print')}</Button>
          </Stack>
        </>
        :
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center">
          <ShoppingCartIcon/>
          <div>{t('Start adding products')}</div>
        </Box>
      }
    </Box>}
    {(checks.length > 0 && checks[selectedCheckIndex]) &&
    <DiscountPopup
      open={discountsOpen}
      onClose={() => setDiscountsOpen(false)}
      onChange={onChangeDiscount}
      check={checks[selectedCheckIndex]}
      currency={props.currency} />}
  </>);
}
