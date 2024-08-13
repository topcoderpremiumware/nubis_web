import React from 'react';
import './../../i18nextConf';
import "./../App.scss";
import {Button, Grid} from "@mui/material";
import {useTranslation} from "react-i18next";
import Box from "@mui/material/Box";
import women_on_bad from "../assets/women_on_bad.png"
import people_files from "../assets/people_files.png"

export default function DeliverySlide(props) {
  const {t} = useTranslation();

  return (<>
    <Box className="slide_title" style={{marginTop: '48px',textAlign:'center'}} sx={{mb: 1}}>{t('Delivery Method')}</Box>
    <div style={{
      textAlign: 'center',
      marginBottom: '48px',
      color: '#495057'
    }}>{t('Choose how would you like the item to be delivered')}</div>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <div className="option_item">
          <div className="image" style={{"--image-background": `url('${women_on_bad}')`}}></div>
          <Button className="giftcard_button blue" variant="contained" type="button" fullWidth
                  onClick={e => props.onChange({target:{name:'receiver',value:false}})}>{t('Your email')}</Button>
        </div>
      </Grid>
      <Grid item xs={12} md={6}>
        <div className="option_item">
          <div className="image" style={{"--image-background": `url('${people_files}')`}}></div>
          <Button className="giftcard_button blue" variant="contained" type="button" fullWidth
                  onClick={e => props.onChange({target:{name:'receiver',value:true}})}>{t('Receiver Email')}</Button>
        </div>
      </Grid>
    </Grid>
  </>);
}
