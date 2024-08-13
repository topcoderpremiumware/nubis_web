import React, {useEffect, useState} from 'react';
import './../../i18nextConf';
import "./../App.scss";
import {Button, Grid, Stack} from "@mui/material";
import {useTranslation} from "react-i18next";
import eventBus from "../../eventBus";

export default function ExperienceSlide(props) {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(true)
  const [menus, setMenus] = useState([]);
  const [language, setLanguage] = useState(localStorage.getItem('i18nextLng') || props.place.language)

  useEffect( () => {
    getMenus()
    eventBus.on("langChanged",(lang) => {
      setLanguage(lang)
    })
  }, [])

  const getMenus = async () => {
    setLoading(true)
    await axios.get(`${process.env.MIX_API_URL}/api/giftcard_menus`, {
      params:{
        place_id: props.place.id
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setMenus(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  return (<>
    <div style={{
      textAlign:'center',
      marginTop:'24px',
      marginBottom:'48px',
      color: '#C8C8C8'
    }}>{t('Choose BELOW which type you want and proceed by clicking on the cart')}</div>
    <Grid container spacing={3}>
      {menus.map((menu,key) => {
        return <Grid item xs={12} md={4} key={key}>
          <div className="option_item">
            <div className="image" style={{"--image-background": `url('${menu.image_url}')`}}></div>
            <div className="type_title">{menu.labels?.[language]?.['name']}</div>
            <Stack spacing={3} direction="row">
              <Button className="giftcard_button blue" variant="contained" type="button" fullWidth
                    onClick={e => props.onChange({target:{name:'experience',value:menu}})}>{t('Read More')}</Button>
              <div className="price_badge">{menu.price} {props.currency}</div>
            </Stack>
          </div>
        </Grid>
      })}
    </Grid>
  </>);
}
