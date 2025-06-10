import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  styled,
  Table, TableBody, TableCell, TableContainer, TableRow, TextField,
} from "@mui/material";
import React from "react";
import {StyledTableRow} from "../../../components/StyledTableRow";
import ProductPriceInput from "../../../components/ProductPriceInput";

export default function CheckTable(props){
  const {t} = useTranslation();

  return (
    <TableContainer>
      <Table>
        <TableBody>
          {props.check ? <>
            {props.check.products && props.check.products.map((product, key) => {
              return <StyledTableRow key={key} style={props.showPrinted && product.pivot.is_printed ? { background: 'rgba(255,0,0,0.35)' } : {}}>
                <TableCell size="small">{props.quantityButtons(product)}</TableCell>
                <TableCell size="small" style={{width: '100%'}}>{product.name}</TableCell>
                {props.onChangeProductPrice && product.is_free_price ?
                  <TableCell size="small" align="right" style={{padding: '0px'}}>
                    <ProductPriceInput onChangeProductPrice={props.onChangeProductPrice} product={product} />
                  </TableCell>
                  :
                  <TableCell size="small" align="right">{(product.pivot.price*product.pivot.quantity)?.toFixed(2)}</TableCell>
                }

              </StyledTableRow>
            })}
            <StyledTableRow>
              <TableCell size="small"></TableCell>
              <TableCell size="small">{t('Subtotal')}</TableCell>
              <TableCell size="small" align="right">{props.check.subtotal?.toFixed(2) || '0.00'}</TableCell>
            </StyledTableRow>
            {props.check.discount &&
              <StyledTableRow>
                <TableCell size="small"></TableCell>
                <TableCell size="small">{t('Discount')}</TableCell>
                <TableCell size="small" align="right">
                  {parseFloat(props.check.discount)?.toFixed(2)}{props.check.discount_type.includes('percent') ? '%' : ''}
                </TableCell>
              </StyledTableRow>}
            {(props.check && props.check.advance_id) &&
            <StyledTableRow>
              <TableCell size="small"></TableCell>
              <TableCell size="small"><b>{t('Prepayment')} #{props.check.advance?.place_check_id}</b></TableCell>
              <TableCell size="small" align="right"><b>{(props.check.advance?.total*-1).toFixed(2) || '0.00'}</b></TableCell>
            </StyledTableRow>}
            <StyledTableRow>
              <TableCell size="small"></TableCell>
              <TableCell size="small"><b>{props.check.payment_on_delivery ? t('Prepayment') : t('Total')}</b></TableCell>
              <TableCell size="small" align="right"><b>{props.check.total?.toFixed(2) || '0.00'}</b></TableCell>
            </StyledTableRow>
          </>: <></>}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
