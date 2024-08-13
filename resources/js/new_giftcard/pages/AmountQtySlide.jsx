import React from 'react';
import './../../i18nextConf';
import "./../App.scss";
import {Button, Grid, TextField} from "@mui/material";
import {Trans, useTranslation} from "react-i18next";
import Box from "@mui/material/Box";
import pdf_example from "../assets/pdf_example.jpg"
import VisibilityIcon from '@mui/icons-material/Visibility';
import eventBus from "../../eventBus";

export default function AmountQtySlide(props) {
  const {t} = useTranslation();

  return (<>
    <Grid container spacing={3} style={{marginTop: '48px'}}>
      <Grid item xs={12} md={6}>
        <div className="option_item">
          <Box className="slide_title" sx={{mb: 3}}>{t('Information')}</Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <img src={pdf_example} alt="pdf_example" style={{maxWidth:'278px',margin:'auto',display:'block'}}/>
            </Grid>
            <Grid item xs={12} md={6}>
              <div className="gray_text"><Trans i18nKey="GifcardAmountDescriotion">
                You can now buy a gift cart for an amount of your choice. On the following pages you can personalise
                your gift cart with a greetings and pictures . Then choose how you would like the gift cart to be
                delivered.<br/>
                Enjoy!
              </Trans></div>
              <Button className="giftcard_button" variant="outlined" sx={{mt:3}} fullWidth
                      onClick={e => eventBus.dispatch('seeExample',props.giftcard)}>{t('See examples')}&nbsp;&nbsp;<VisibilityIcon/></Button>
            </Grid>
          </Grid>
        </div>
      </Grid>
      <Grid item xs={12} md={6}>
        <div className="option_item">
          <Grid container spacing={3} style={{marginTop:'30px'}}>
            <Grid item xs={12} md={6}>
              <div className="label_title">{t('Choose value')}</div>
              <div className="gray_text">{t('Choose your amount and quantity and click NEXT')}</div>
            </Grid>
            <Grid item xs={12} md={6}>
              <div className="label_title">{t('Validity')}</div>
              <div className="gray_text">{t('36 Months')}</div>
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{marginTop:'50px'}}>
            <Grid item xs={12} md={6}>
              <div className="label_title">{t('Amount in')} {props.currency}</div>
              <TextField size="small" fullWidth sx={{mb:2}}
                         type="text" id="amount" name="amount" required
                         onChange={props.onChange} value={props.giftcard.amount || ''}
              />
              <Grid container spacing={2}>
                {[1000,1500,2000].map((item,key) => {
                  return <Grid item xs={4} key={key}><Button className="price_badge" variant="contained" type="button" fullWidth
                                            onClick={e => props.onChange({target:{name:'amount',value:item}})}>{item}</Button></Grid>
                })}
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <div className="label_title">{t('Quantity')}</div>
              <TextField size="small" fullWidth sx={{mb:2}}
                         type="text" id="quantity" name="quantity" required
                         onChange={props.onChange} value={props.giftcard.quantity || ''}
              />
              <Button className="giftcard_button blue" variant="contained" type="button" fullWidth
                      onClick={e => props.onChange({target:{name:'amount_finish'}})}>{t('Next')}</Button>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  </>);
}
