import {useTranslation} from "react-i18next";
import {useParams} from "react-router-dom";
import {datetimeFormat, simpleCatchError} from "../../../helper";
import React, { useEffect, useState } from 'react'
import {
  Button, Container, InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow, TextField
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import {StyledTableRow} from "../../components/StyledTableRow";
import Box from "@mui/material/Box";
import SplitCheckPopup from "../DayView/Pos/SplitCheckPopup";
import eventBus from "../../../eventBus";
import TerminalRefundPopup from "./TerminalRefundPopup";
import {qzTrayPrint} from "../../../qzTray";

const Receipt = () => {
  const { t } = useTranslation();
  let { id } = useParams();
  const [receipt, setReceipt] = useState({})
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState({})
  const [splitCheckOpen, setSplitCheckOpen] = useState(false)
  const [refundDescription, setRefundDescription] = useState(null)
  const [terminalRefundOpen, setTermnalRefundOpen] = useState(false)
  const [refundId, setRefundId] = useState(0)
  const [refundAmount, setRefundAmount] = useState(0)

  const discountTypes = {
    our_code_amount: t('Our gift card'),
    code_amount: t('Other gift card'),
    custom_amount: t('Custom amount'),
    custom_percent: t('Custom percent')
  }

  useEffect(() => {
    getReceipt()
    getPaymentMethod()
  }, [])

  const getReceipt = async () => {
    setLoading(true)
    await axios.get(`${process.env.MIX_API_URL}/api/receipts/${id}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setReceipt(response.data)
      setLoading(false)
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const openPDF = (receipt_id = receipt.id) => {
    axios.post(`${process.env.MIX_API_URL}/api/checks/${receipt_id}/print`,{}, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      responseType: 'blob'
    }).then(response => {
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      qzTrayPrint(['receipts','all_prints'], pdfBlob, () => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        if(window.ReactNativeWebView){
          window.location.href = pdfUrl;
          window.ReactNativeWebView.postMessage('print_receipt');
        }else{
          window.open(pdfUrl, '_blank');
          URL.revokeObjectURL(pdfUrl);
        }
      })
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const getPaymentMethod = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/payment_method`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    setPaymentMethod(res.data)
  }

  const getVat = (receipt) => {
    let vat = 0
    receipt.products.forEach((item) => {
      let pTotal = item.pivot.price * item.pivot.quantity

      if(receipt.discount){
        let pDiscount = 0
        if(receipt.discount_type.includes('percent')) {
          pDiscount = pTotal * receipt.discount / 100
        }else{
          pDiscount = pTotal * receipt.discount / receipt.subtotal
        }
        pTotal = pTotal - pDiscount
      }

      vat += pTotal - pTotal / (1 + item.tax / 100);
    })
    return vat.toFixed(2)
  }

  const onSelectRefundProducts = (oldCheck, newCheck) => {
    axios.post(`${process.env.MIX_API_URL}/api/checks/${receipt.id}/refund`, {
      products: newCheck.products,
      refund_description: refundDescription
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      getReceipt()
      setSplitCheckOpen(false)
      eventBus.dispatch("notification", {type: 'success', message: 'Refunded successfully'});
      if(response.data.card_amount > 0){
        setTermnalRefundOpen(true)
        setRefundId(response.data.id)
        setRefundAmount(response.data.card_amount)
      }else{
        openPDF(response.data.id)
      }
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const refund = () => {
    setSplitCheckOpen(true)
  }

  return (<>
    {loading ? <CircularProgress/> :
    <div className='pages__container'>
      <Stack spacing={2} mb={2} direction="row" alignItems="center">
        <h2>{t('Receipt')} #{receipt.place_check_id}</h2>
        <Button style={{marginLeft:'auto'}}
                variant="contained"
                type="button"
                onClick={() => openPDF()}
        >{t('Print receipt')}</Button>
        <Button variant="contained"
                type="button"
                onClick={() => refund()}
        >{t('Refund')}</Button>
      </Stack>
      <div>{datetimeFormat(receipt.printed_at)}</div>
      <Container maxWidth="md" disableGutters={true}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell size="small"><b>{t('Item')}</b></TableCell>
                <TableCell size="small" align="right" width="100"><b>{t('Quantity')}</b></TableCell>
                <TableCell size="small" align="right" width="120"><b>{t('Total')}</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipt.products.map((item, key) => {
                return <StyledTableRow key={key}>
                  <TableCell size="small">{item.name}</TableCell>
                  <TableCell size="small" align="right">{item.pivot.quantity}</TableCell>
                  <TableCell size="small" align="right">{paymentMethod['online-payment-currency']} {(item.pivot.quantity * item.pivot.price).toFixed(2)}</TableCell>
                </StyledTableRow>
              })}
              <StyledTableRow>
                <TableCell size="small" align="right" colSpan="3"><b>{t('Subtotal')}</b>: {paymentMethod['online-payment-currency']} {receipt.subtotal.toFixed(2)}</TableCell>
              </StyledTableRow>
              {receipt.discount && <StyledTableRow>
                <TableCell size="small" align="right" colSpan="3">
                  <b>{t('Discount type')}</b>: {discountTypes[receipt.discount_type]} {receipt.discount_name ? receipt.discount_name : ''} {receipt.discount_code ? `(${receipt.discount_code})` : ''} |&nbsp;
                  <b>{t('Discount')}</b>: {receipt.discount_type.includes('percent') ? '' : paymentMethod['online-payment-currency']}&nbsp;
                  {receipt.discount.toFixed(2)} {receipt.discount_type.includes('percent') ? '%' : ''}
                </TableCell>
              </StyledTableRow>}
              <StyledTableRow>
                <TableCell size="small" align="right" colSpan="3"><b>{t('VAT')}</b>: {paymentMethod['online-payment-currency']} {getVat(receipt)}</TableCell>
              </StyledTableRow>
              <StyledTableRow>
                <TableCell size="small" align="right" colSpan="3"><b>{t('Total')}</b>: {paymentMethod['online-payment-currency']} {receipt.total.toFixed(2)}</TableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{mt:3}}><h5>{t('Payment information')}</h5></Box>
        <TableContainer>
          <Table>
            <TableBody>
              <StyledTableRow>
                <TableCell size="small"><b>{t('Payment')}</b>: {receipt.payment_method}</TableCell>
                <TableCell size="small"><b>{t('Total')}</b>: {paymentMethod['online-payment-currency']} {receipt.total.toFixed(2)}</TableCell>
              </StyledTableRow>
              <StyledTableRow>
                <TableCell size="small"><b>{t('Cashier')}</b>: {receipt.printed?.name}</TableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {receipt.refunds.length > 0 && <>
          <Box sx={{mt:3}}><h5>{t('Refunds')}</h5></Box>
          {receipt.refunds.map((refund, r_key) => {
            return <div key={r_key}>
              <hr/>
              <div>{datetimeFormat(refund.created_at)} {refund.refund_description ? <>- {refund.refund_description}</> : ''}</div>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell size="small"><b>{t('Item')}</b></TableCell>
                      <TableCell size="small" align="right" width="100"><b>{t('Quantity')}</b></TableCell>
                      <TableCell size="small" align="right" width="120"><b>{t('Total')}</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {refund.products.map((item, key) => {
                      return <StyledTableRow key={key}>
                        <TableCell size="small">{item.name}</TableCell>
                        <TableCell size="small" align="right">{item.pivot.quantity}</TableCell>
                        <TableCell size="small"
                                   align="right">{paymentMethod['online-payment-currency']} {(item.pivot.quantity * item.pivot.price).toFixed(2)}</TableCell>
                      </StyledTableRow>
                    })}
                    <StyledTableRow>
                      <TableCell size="small" align="right"
                                 colSpan="3"><b>{t('Subtotal')}</b>: {paymentMethod['online-payment-currency']} {refund.subtotal.toFixed(2)}
                      </TableCell>
                    </StyledTableRow>
                    {!!refund.discount && <StyledTableRow>
                      <TableCell size="small" align="right" colSpan="3">
                        <b>{t('Discount type')}</b>: {discountTypes[refund.discount_type]} {refund.discount_name ? refund.discount_name : ''} {refund.discount_code ? `(${refund.discount_code})` : ''} |&nbsp;
                        <b>{t('Discount')}</b>: {refund.discount_type.includes('percent') ? '' : paymentMethod['online-payment-currency']}&nbsp;
                        {refund.discount.toFixed(2)} {refund.discount_type.includes('percent') ? '%' : ''}
                      </TableCell>
                    </StyledTableRow>}
                    <StyledTableRow>
                      <TableCell size="small" align="right"
                                 colSpan="3"><b>{t('VAT')}</b>: {paymentMethod['online-payment-currency']} {getVat(refund)}
                      </TableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <TableCell size="small" align="right"
                                 colSpan="3"><b>{t('Total')}</b>: {paymentMethod['online-payment-currency']} {refund.total.toFixed(2)}
                      </TableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          })}
        </>}
      </Container>
      <SplitCheckPopup
        open={splitCheckOpen}
        onClose={() => setSplitCheckOpen(false)}
        onChange={onSelectRefundProducts}
        check={receipt}>
        <TextField label={t('Refund description')} size="small" fullWidth sx={{mt: 2}}
                   type="text" id="refund_description" name="refund_description" required
                   onChange={(e) => setRefundDescription(e.target.value)}
                   value={refundDescription}
        />
      </SplitCheckPopup>
      <TerminalRefundPopup
        open={terminalRefundOpen}
        onClose={() => {
          setTermnalRefundOpen(false);
          openPDF(refundId)
        }}
        check_id={refundId}
        amount={refundAmount}
        />
    </div>}
  </>)
}

export default Receipt
