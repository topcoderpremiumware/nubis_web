import React, {useEffect, useState} from 'react';
import './../../i18nextConf';
import "./../App.scss";
import {Button, FormControlLabel, Grid, Switch, TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import Box from "@mui/material/Box";
import VisibilityIcon from '@mui/icons-material/Visibility';
import eventBus from "../../eventBus";

export default function ExperienceQtySlide(props) {
  const {t} = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem('i18nextLng') || props.place.language)

  useEffect( () => {
    eventBus.on("langChanged",(lang) => {
      setLanguage(lang)
    })
  }, [])

  return (<>
    <Grid container spacing={3} style={{marginTop: '48px'}}>
      <Grid item xs={12} md={8}>
        <div className="option_item">
          <Grid container spacing={3} className="xs_column_reverse">
            <Grid item xs={12} md={6} style={{display:'flex',flexDirection:'column'}}>
              <Box className="slide_title" sx={{mb: 3}}>{props.giftcard.experience.labels?.[language]?.name}</Box>
              <div>{props.giftcard.experience.labels?.[language]?.description}</div>
              <Grid container spacing={3} sx={{mt:'auto'}}>
                <Grid item>
                  <Button className="giftcard_button" variant="outlined" fullWidth
                          onClick={e => eventBus.dispatch('seeExample',props.giftcard)}>{t('See examples')}&nbsp;&nbsp;<VisibilityIcon/></Button>
                </Grid>
                <Grid item>
                  <div className="price_badge">{props.giftcard.experience.price} {props.currency}</div>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <div className="exp_image" style={{"--image-background": `url('${props.giftcard.experience.image_url}')`}}></div>
            </Grid>
          </Grid>
        </div>
      </Grid>
      <Grid item xs={12} md={4}>
      <div className="option_item">
          <Grid container spacing={3} style={{marginTop:'30px'}}>
            <Grid item xs={12} md={6}>
              <div className="label_title">{t('Choose value')}</div>
              <div className="gray_text">{t('Choose your quantity and click NEXT')}</div>
            </Grid>
            <Grid item xs={12} md={6}>
              <div className="label_title">{t('Validity')}</div>
              <div className="gray_text">{t('36 Months')}</div>
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{marginTop:'50px'}}>
            <Grid item xs={12} md={12}>
              <div className="label_title">{t('Quantity')}</div>
              <TextField size="small" fullWidth sx={{mb:2}}
                         type="text" id="quantity" name="quantity" required
                         onChange={props.onChange} value={props.giftcard.quantity || ''}
              />
              {props.giftcard.quantity > 1 && <FormControlLabel
                label={t('Quantity in one gift card')} labelPlacement="end" sx={{mb:2}}
                control={
                  <Switch onChange={props.onChange}
                          name="qty_together"
                          checked={props.giftcard.qty_together || false} />
                }/>}
              <Button className="giftcard_button blue" variant="contained" type="button" fullWidth
                      onClick={e => props.onChange({target:{name:'experience_finish'}})}>{t('Next')}</Button>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  </>);
}
