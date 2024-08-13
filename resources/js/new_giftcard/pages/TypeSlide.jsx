import React from 'react';
import './../../i18nextConf';
import "./../App.scss";
import {Button, Grid} from "@mui/material";
import {useTranslation} from "react-i18next";

export default function TypeSlide(props) {
  const {t} = useTranslation();

  const getPicture = (purpose, is_array= false) => {
    let picture = props.pictures.filter(el => el.purpose === purpose)
    if(picture.length === 0) return ''
    if(is_array){
      return picture
    }else{
      return picture[0].url
    }
  }

  return (<>
    <div style={{
      textAlign:'center',
      marginTop:'24px',
      marginBottom:'48px',
      color: '#C8C8C8'
    }}>{t('Choose BELOW which type you want and proceed by clicking on the cart')}</div>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <div className="option_item">
          <div className="image" style={{"--image-background": `url('${getPicture('giftcard_on_amount')}')`}}></div>
          <div className="type_title"><span className="big">{t('Gift Cart')}</span> {t('For an amount')}</div>
          <Button className="giftcard_button blue" variant="contained" type="button" fullWidth
                  onClick={e => props.onChange({target:{name:'type',value:'amount'}})}>{t('Get Now')}</Button>
        </div>
      </Grid>
      <Grid item xs={12} md={6}>
        <div className="option_item">
          <div className="image" style={{"--image-background": `url('${getPicture('giftcard_on_experience')}')`}}></div>
          <div className="type_title"><span className="big">{t('Gift Cart')}</span> {t('For an experience')}</div>
          <Button className="giftcard_button blue" variant="contained" type="button" fullWidth
                  onClick={e => props.onChange({target:{name:'type',value:'experience'}})}>{t('Get Now')}</Button>
        </div>
      </Grid>
    </Grid>
  </>);
}
