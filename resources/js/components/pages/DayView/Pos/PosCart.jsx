import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary, Button,
  CircularProgress,
  IconButton, Menu, MenuItem,
  Stack,
  TextField, Tooltip,
} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from "axios";
import eventBus from "../../../../eventBus";
import Box from "@mui/material/Box";
import NumberButtons from "../../../components/NumberButtons";
import {isBills, simpleCatchError} from "../../../../helper";
import DiscountPopup from "./DiscountPopup";
import SplitCheckPopup from "./SplitCheckPopup";
import CheckTable from "./CheckTable";
import ChangeTablePopup from "./ChangeTablePopup";
import ChangeOrder from "./ChangeOrder";
import PaymentMethodPopup from "./PaymentMethodPopup";
import {calcCheckTotal} from "./posHelper";
import PrintProductsPopup from "./PrintProductsPopup";
import {qzTrayPrint} from "../../../../qzTray";
import {localPrint} from "../../../../localPrint";
const printFunction = (window.ipcRenderer || window.ReactNativeWebView) ? localPrint : qzTrayPrint;
import AddIcon from '@mui/icons-material/Add';
import SendReceiptPopup from "./SendReceiptPopup";

export default function PosCart(props){
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false)
  const [checks, setChecks] = useState([])
  const [selectedCheckIndex, setSelectedCheckIndex] = useState(null)
  const [discountsOpen, setDiscountsOpen] = useState(false)
  const [splitCheckOpen, setSplitCheckOpen] = useState(false)
  const [printProductsOpen, setPrintProductsOpen] = useState(false)
  const [printProductsType, setPrintProductsType] = useState(null)
  const [changeTableOpen, setChangeTableOpen] = useState(false)
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false)
  const [sendReceiptOpen, setSendReceiptOpen] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const openMenu = Boolean(menuAnchorEl);
  const [selectedMenuCheck, setSelectedMenuCheck] = useState(null)
  const [orderComment, setOrderComment] = useState(props.order.comment)

  const handleMenuClick = (event, check) => {
    event.stopPropagation()
    setSelectedMenuCheck(check)
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = (event) => {
    event.stopPropagation()
    setMenuAnchorEl(null);
  };

  const checksRef = useRef(checks);
  const selectedCheckIndexRef = useRef(selectedCheckIndex);

  useEffect(() => {
    console.log('sendReceiptOpen',sendReceiptOpen)
  },[sendReceiptOpen])

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
          order_id: props.order.id,
          status: 'open',
          subtotal: product.selling_price,
          total: product.selling_price,
          products: [{...product, pivot:{price: product.selling_price, quantity: 1}}]
        })
        setSelectedCheckIndex(0)
      }else {
        if(tempChecks[selectedCheckIndexRef.current].advance_id) return
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
      }
      let totals = calcCheckTotal(tempChecks[selectedCheckIndexRef.current])
      tempChecks[selectedCheckIndexRef.current].total = totals['total']
      tempChecks[selectedCheckIndexRef.current].subtotal = totals['subtotal']
      setChecks(prev => ([...tempChecks]))
    }
    function handleRemoveProductToCart(product){
      let tempChecks = checksRef.current
      if(tempChecks[selectedCheckIndexRef.current].advance_id) return
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
    function openReceiptPDF(){
      setSendReceiptOpen(true)
      openPDF()
    }
    function madeReversal(){
      correct()
    }
    eventBus.on("addProductToCart", handleAddProductToCart)
    eventBus.on("removeProductToCart", handleRemoveProductToCart)
    eventBus.on("placeChanged", handlePlaceChanged)
    eventBus.on("openReceiptPDF", openReceiptPDF)
    eventBus.on("madeReversal", madeReversal)
    return () => {
      eventBus.remove("addProductToCart", handleAddProductToCart)
      eventBus.remove("removeProductToCart", handleRemoveProductToCart)
      eventBus.remove("placeChanged", handlePlaceChanged)
      eventBus.remove("openReceiptPDF", openReceiptPDF)
      eventBus.remove("madeReversal", madeReversal)
    }
  }, [props.order.id])

  useEffect(() => {
    checksRef.current = checks;
  },[checks])

  useEffect(() => {
    selectedCheckIndexRef.current = selectedCheckIndex;
  },[selectedCheckIndex])

  const getChecks = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/orders/${props.order.id}/checks`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setChecks(prev => ([...response.data]))
      if(response.data.length > 0) setSelectedCheckIndex(0)
      setLoading(false)
    }).catch(error => {
    })
  }

  const saveCheck = async (check = false,scIndex = false) => {
    if(!check) check = checks[selectedCheckIndex]
    if(!scIndex) scIndex = selectedCheckIndex
    let url = `${process.env.MIX_API_URL}/api/checks`
    if (check.hasOwnProperty('id')) {
      url = `${process.env.MIX_API_URL}/api/checks/${check.id}`
    }

    return await axios.post(url, check, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      if (!check.hasOwnProperty('id')) {
        let tempChecks = checksRef.current
        console.log('checks length',tempChecks.length,scIndex)
        tempChecks[scIndex].id = response.data.id
        tempChecks[scIndex].printed_id = response.data.printed_id
        setChecks(prev => ([...tempChecks]))
      }
      setPaymentMethodOpen(false)
      setSendReceiptOpen(true)
      eventBus.dispatch("notification", {type: 'success', message: 'Cart saved successfully'});
      return true
    }).catch(error => {
      simpleCatchError(error)
      return false
    })
  }

  const addCart = () => {
    setChecks(prev => ([...prev,{
      place_id: localStorage.getItem('place_id'),
      order_id: props.order.id,
      status: 'open',
      total: 0,
      products: []
    }]))
    setSelectedCheckIndex(checks.length)
  }

  const deleteCart = (e,check) => {
    e.stopPropagation()
    setSelectedCheckIndex(0)
    if (window.confirm(t('Are you sure you want to delete this cart?'))) {
      if(check.hasOwnProperty('id')){
        axios.delete(`${process.env.MIX_API_URL}/api/checks/${check.id}`, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          getChecks()
          eventBus.dispatch("notification", {type: 'success', message: 'Cart deleted successfully'});
        }).catch(error => {
          eventBus.dispatch("notification", {type: 'error', message: error.message});
          console.log('Error', error)
        })
      }else{
        checks.splice(checks.indexOf(check), 1)
      }
    }
    handleMenuClose(event)
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

  const onChangeSplitCheck = (oldCheck, newCheck) => {
    let tempChecks = checks
    tempChecks[selectedCheckIndex] = oldCheck
    tempChecks[tempChecks.length] = newCheck
    setChecks(prev => ([...tempChecks]))
    setSplitCheckOpen(false)
  }

  const onChangeTable = async (orderId) => {
    let tempChecks = checks
    tempChecks[selectedCheckIndex].order_id = orderId
    setChecks(prev => ([...tempChecks]))
    setChangeTableOpen(false)
    await saveCheck()
    tempChecks.splice(selectedCheckIndex, 1)
    setSelectedCheckIndex(null)
    setChecks(prev => ([...tempChecks]))
  }

  const onChangePaymentMethod = async (data) => {
    let tempChecks = checks
    if (tempChecks[selectedCheckIndex].status === 'closed') {
      setSendReceiptOpen(true)
      openPDF()
    } else {
      tempChecks[selectedCheckIndex] = {...tempChecks[selectedCheckIndex], ...data}
      setChecks(prev => ([...tempChecks]))
      saveCheck(tempChecks[selectedCheckIndex],selectedCheckIndex).then((res) => {
        if(res) openPDF()
      })
    }
  }

  const onChangeSendReceipt = (data) => {
    axios.post(`${process.env.MIX_API_URL}/api/checks/${checksRef.current[selectedCheckIndexRef.current].id}/send`,data, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: `Receipt link sent by ${data.type}`})
      setSendReceiptOpen(false)
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const openPDF = () => {
    axios.post(`${process.env.MIX_API_URL}/api/checks/${checksRef.current[selectedCheckIndexRef.current].id}/print`,{}, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      responseType: 'blob'
    }).then(response => {
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      printFunction(['receipts','all_prints'], pdfBlob, () => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        if(window.ReactNativeWebView){
          window.location.href = pdfUrl;
          window.ReactNativeWebView.postMessage(JSON.stringify({action: 'print_receipt'}));
        }else{
          window.open(pdfUrl, '_blank');
          URL.revokeObjectURL(pdfUrl);
        }
      })

      if(checksRef.current.printed_id){
        let tempChecks = checksRef.current
        tempChecks[selectedCheckIndexRef.current].status = 'closed'
        setChecks(prev => ([...tempChecks]))
      }
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const createRemainderCheck = () => {
    console.log('createRemainderCheck')
    let check = checks[selectedCheckIndex]
    axios.post(`${process.env.MIX_API_URL}/api/checks/${check.id}/full_payment`, {
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Remainder receipt created successfully'});
      getChecks()
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const menuItems = () => {
    let items = [];
    if(selectedMenuCheck && selectedMenuCheck.status !== 'closed'){
      items.push(<MenuItem key="1" onClick={(e) => {deleteCart(e,selectedMenuCheck)}}>{t('Delete')}</MenuItem>)
    }
    if(selectedMenuCheck && selectedMenuCheck.status !== 'closed' && selectedMenuCheck === checks[selectedCheckIndex]){
      items.push(<MenuItem key="2" onClick={(e) => {setSplitCheckOpen(true);handleMenuClose(event)}}>{t('Split')}</MenuItem>)
    }
    if(!isBills(['pos','pos_terminal']) && selectedMenuCheck && selectedMenuCheck.status !== 'closed' && selectedMenuCheck === checks[selectedCheckIndex]){
      items.push(<MenuItem key="3" onClick={(e) => {setChangeTableOpen(true);handleMenuClose(event)}}>{t('Change table')}</MenuItem>)
    }
    if(selectedMenuCheck && selectedMenuCheck.status !== 'closed' && selectedMenuCheck === checks[selectedCheckIndex] &&
      checks[selectedCheckIndex].hasOwnProperty('id')){
      items.push(<MenuItem key="4" onClick={(e) => {
        setPrintProductsType('food')
        setPrintProductsOpen(true)
        handleMenuClose(event)
      }}>{t('Print for kitchen')}</MenuItem>)
    }
    if(selectedMenuCheck && selectedMenuCheck.status !== 'closed' && selectedMenuCheck === checks[selectedCheckIndex] &&
      checks[selectedCheckIndex].hasOwnProperty('id')){
      items.push(<MenuItem key="5" onClick={(e) => {
        setPrintProductsType('drink')
        setPrintProductsOpen(true)
        handleMenuClose(event)}
      }>{t('Print for bar')}</MenuItem>)
    }
    if(selectedMenuCheck && selectedMenuCheck === checks[selectedCheckIndex] &&
      checks[selectedCheckIndex].hasOwnProperty('id')){
      items.push(<MenuItem key="6" onClick={(e) => setSendReceiptOpen(true)}>{t('Send receipt')}</MenuItem>)
    }
    if(selectedMenuCheck && selectedMenuCheck === checks[selectedCheckIndex] &&
      checks[selectedCheckIndex].hasOwnProperty('id') && checks[selectedCheckIndex].payment_on_delivery && !checks[selectedCheckIndex].remainder){
      items.push(<MenuItem key="7" onClick={(e) => createRemainderCheck()}>{t('Full payment')}</MenuItem>)
    }
    return items
  }

  const correct = () => {
    let check = checks[selectedCheckIndex]
    axios.post(`${process.env.MIX_API_URL}/api/checks/${check.id}/refund`, {
      products: check.products,
      refund_description: 'Receipt correction'
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Refunded successfully'});
      let newCheck = {...check, status: 'open'}
      let newIndex = checks.length
      delete newCheck.id
      delete newCheck.payment_method
      setChecks(prev => ([...prev,{...newCheck}]))
      setSelectedCheckIndex(newIndex)
      saveCheck(newCheck,newIndex)
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const onChangeProductPrice = (product,price) => {
    let tempChecks = checksRef.current

    if(tempChecks[selectedCheckIndexRef.current].status === 'closed'){
      eventBus.dispatch("notification", {type: 'error', message: 'Cart is closed'});
      return
    }
    let index = tempChecks[selectedCheckIndexRef.current].products.findIndex(e => e.id === product.id)
    if (index >= 0) {
      product = tempChecks[selectedCheckIndexRef.current].products[index]
      tempChecks[selectedCheckIndexRef.current].products[index] = {
        ...product,
        pivot:{
          ...product.pivot,
          price: price
        }
      }

      let totals = calcCheckTotal(tempChecks[selectedCheckIndexRef.current])
      tempChecks[selectedCheckIndexRef.current].total = totals['total']
      tempChecks[selectedCheckIndexRef.current].subtotal = totals['subtotal']
      setChecks(prev => ([...tempChecks]))
    }
  }

  const updateOrderComment = () => {
    axios.post(`${process.env.MIX_API_URL}/api/orders/${props.order.id}/comment`, {
      comment: orderComment
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Comment saved successfully'});
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  return (<>
    <Stack spacing={2} mb={2} direction="row" alignItems="center">
      <h5>{t('Shopping cart')}</h5>
      <Stack direction="row">
        <ChangeOrder orderId={props.order.id} />
        {isBills(['pos','pos_terminal']) && <IconButton onClick={e => {eventBus.dispatch('pos_create_order')}}>
          <Tooltip title={t('New order')}><AddIcon/></Tooltip>
        </IconButton>}
      </Stack>
      <span style={{marginLeft: 'auto'}}></span>
      <IconButton onClick={e => {addCart()}}>
        <Tooltip title={t('New cart')}><AddShoppingCartIcon/></Tooltip>
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
              <Box style={{display: 'flex', alignItems: 'center'}}>{t('Cart')} #{check.place_check_id}
                {(check.status !== 'closed' && selectedCheckIndex === key) ?
                  <TextField label={t('Title')} size="small" sx={{ml: 1}}
                             type="text" id="name" name="name"
                             onChange={onChangeDiscount}
                             value={check.name}
                  /> : <> {check.name}</>}
                <IconButton
                  aria-label="more"
                  id={`menu_button`}
                  aria-controls={openMenu ? `cart_menu` : undefined}
                  aria-expanded={openMenu ? 'true' : undefined}
                  aria-haspopup="true"
                  onClick={(e) => handleMenuClick(e,check)}
                  size="small"
                  sx={{padding: "0 5px",marginLeft: "auto"}}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{p: 0}}>
              <CheckTable
                onChangeProductPrice={onChangeProductPrice}
                check={check}
                quantityButtons={(product) => <NumberButtons
                  value={product.pivot.quantity}
                  onAdd={e => eventBus.dispatch('addProductToCart',product)}
                  onRemove={e => eventBus.dispatch('removeProductToCart',product)}/>}
              />
            </AccordionDetails>
          </Accordion>
        })}
          <Stack spacing={2} sx={{mt: 2}} direction="row">
            <Button variant="contained" type="button" disabled={!checks.hasOwnProperty(selectedCheckIndex) || checks[selectedCheckIndex].status === 'closed'} onClick={e => setDiscountsOpen(true)}>{t('Discounts')}</Button>
            <Button variant="contained" type="button" disabled={!checks.hasOwnProperty(selectedCheckIndex) || checks[selectedCheckIndex].status === 'closed' || loading} onClick={() => saveCheck()}>{t('Save')}</Button>
            <Button variant="contained" type="button"
                    disabled={!checks.hasOwnProperty(selectedCheckIndex) || !checks[selectedCheckIndex].hasOwnProperty('id')}
                    onClick={e => checks[selectedCheckIndex].status === 'closed' ? openPDF() : setPaymentMethodOpen(true)}>{t('Print')}</Button>
            {/*{checks.hasOwnProperty(selectedCheckIndex) && checks[selectedCheckIndex].status === 'closed' ? <Button variant="contained" type="button"*/}
            {/*        onClick={correct}>{t('Correct')}</Button> : null}*/}
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
      <TextField label={t('Comment')} size="small" multiline rows="3" sx={{mt:3}}
                 type="text" id="comment" name="comment" fullWidth
                 onBlur={updateOrderComment}
                 onChange={e => setOrderComment(e.target.value)}
                 value={orderComment}
      />
    </Box>}
    {(checks.length > 0 && checks[selectedCheckIndex]) && <>
      <DiscountPopup
        open={discountsOpen}
        onClose={() => setDiscountsOpen(false)}
        onChange={onChangeDiscount}
        check={checks[selectedCheckIndex]}
        currency={props.currency} />
      <SplitCheckPopup
        open={splitCheckOpen}
        onClose={() => setSplitCheckOpen(false)}
        onChange={onChangeSplitCheck}
        check={checks[selectedCheckIndex]} />
      <PrintProductsPopup
        open={printProductsOpen}
        onClose={() => setPrintProductsOpen(false)}
        type={printProductsType}
        check={checks[selectedCheckIndex]} />
      <ChangeTablePopup
        open={changeTableOpen}
        onClose={() => setChangeTableOpen(false)}
        onChange={onChangeTable}
        check={checks[selectedCheckIndex]} />
      <PaymentMethodPopup
        open={paymentMethodOpen}
        onClose={() => setPaymentMethodOpen(false)}
        onChange={onChangePaymentMethod}
        check={checks[selectedCheckIndex]}
        currency={props.currency} />
      <SendReceiptPopup
        open={sendReceiptOpen}
        onClose={() => setSendReceiptOpen(false)}
        onChange={onChangeSendReceipt}
        check={checks[selectedCheckIndex]} />
    </>}
    <Menu
      id={`cart_menu`}
      anchorEl={menuAnchorEl}
      open={openMenu}
      onClose={handleMenuClose}
      MenuListProps={{
        'aria-labelledby': `menu_button`,
      }}
    >
      {menuItems()}
    </Menu>
  </>);
}
