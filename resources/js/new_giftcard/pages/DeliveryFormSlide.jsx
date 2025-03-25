import React, {useEffect, useState} from 'react';
import './../../i18nextConf';
import "./../App.scss";
import {Autocomplete, Button, Checkbox, FormControlLabel, Grid, TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import Box from "@mui/material/Box";
import eventBus from "../../eventBus";

export default function DeliveryFormSlide(props) {
  const {t} = useTranslation();
  const [type,setType] = useState('private')
  const [separately,setSeparately] = useState(false)
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCountries()
    function notification(){
      setLoading(false)
    }
    eventBus.on('notification',notification)

    return () => {
      eventBus.remove('notification',notification)
    }
  },[])

  const getCountries = () => {
    axios.get(`${process.env.MIX_API_URL}/api/countries`).then(response => {
      setCountries(response.data.map(el => {
        return {...el, label: el.name }
      }))
    }).catch(error => {
    })
  }

  const receiverForm = () => {
    let output = []
    for(let i=0;i<(separately ? props.giftcard.quantity : 1);i++){
      output.push(<div key={i}>
        <TextField label={t('Name')} size="small" fullWidth sx={{mb: 2}}
                   type="text" id={`receiver_name[${i}]`} name={`receiver_name[${i}]`} required
                   onChange={e => props.onChange({
                     target:{
                       name: 'receiver_name',
                       value: e.target.value,
                       index: i
                     }
                   })}
                   value={props.giftcard.receiver_name?.[i] || ''}
        />
        <TextField label={t('Email')} size="small" fullWidth sx={{mb: 2}}
                   type="email" id={`receiver_email[${i}]`} name={`receiver_email[${i}]`} required
                   onChange={e => props.onChange({
                     target:{
                       name: 'receiver_email',
                       value: e.target.value,
                       index: i
                     }
                   })}
                   value={props.giftcard.receiver_email?.[i] || ''}
        />
      </div>)
    }
    return output
  }

  const currentCountryLabel = () => {
    let cl = countries.find((el) => el.id == props.giftcard.country_id)
    if(cl){
      return cl.label
    }else{
      return null
    }
  }

  return (<>
    <Box className="slide_title" style={{marginTop: '48px',textAlign:'center'}} sx={{mb: 1}}>{t('Insert Delivery Details')}</Box>
    <div style={{
      textAlign: 'center',
      marginBottom: '48px',
      color: '#495057'
    }}>{t('Type in your  e-mail address below and click NEXT')}</div>
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}></Grid>
      <Grid item xs={12} md={6} style={{display: 'flex',flexDirection: 'column'}}>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6} md={6}>
            <Button className={`giftcard_button ${type === 'private' ? 'blue' : ''}`} variant={type === 'private' ? 'contained' : 'outlined'}
                    type="button" fullWidth onClick={e => {
              if (type !== 'private') setType('private')
            }}>{t('Private Costumer')}</Button>
          </Grid>
          <Grid item xs={6} md={6}>
            <Button className={`giftcard_button ${type === 'company' ? 'blue' : ''}`} variant={type === 'company' ? 'contained' : 'outlined'}
                    type="button" fullWidth onClick={e => {
              if (type !== 'company') setType('company')
            }}>{t('Company')}</Button>
          </Grid>
        </Grid>
        <div className="label_title">{t('Your Details')}</div>
        <TextField label={t('Name')} size="small" fullWidth sx={{mb: 2}}
                   type="text" id="name" name="name" required
                   onChange={props.onChange} value={props.giftcard.name || ''}
        />
        <TextField label={t('Email')} size="small" fullWidth sx={{mb: 2}}
                   type="email" id="email" name="email" required
                   onChange={props.onChange} value={props.giftcard.email || ''}
        />
        {type === 'private' ? <>
          {props.giftcard.receiver && <>
            <div className="label_title">{t('Receiver Details')}</div>
            <FormControlLabel sx={{mb: 2}}
              control={
                <Checkbox
                  name="separately"
                  checked={separately}
                  onChange={e =>{setSeparately(e.target.checked); props.onChange(e)} }/>
              }
              label={t('Set email for each item separately')}
              labelPlacement="end"
            />
            {receiverForm()}
          </>}
        </> : <>
          <div className="label_title">{t('Company Details')}</div>
          <TextField label={t('Company name')} size="small" fullWidth sx={{mb: 2}}
                     type="text" id="company_name" name="company_name" required
                     onChange={props.onChange} value={props.giftcard.company_name || ''}
          />
          <TextField label={t('Company address')} size="small" fullWidth sx={{mb: 2}}
                     type="text" id="company_address" name="company_address" required
                     onChange={props.onChange} value={props.giftcard.company_address || ''}
          />
          <TextField label={t('Postcode')} size="small" fullWidth sx={{mb: 2}}
                     type="text" id="post_code" name="post_code" required
                     onChange={props.onChange} value={props.giftcard.post_code || ''}
          />
          <TextField label={t('Company city')} size="small" fullWidth sx={{mb: 2}}
                     type="text" id="company_city" name="company_city" required
                     onChange={props.onChange} value={props.giftcard.company_city || ''}
          />
          <Autocomplete sx={{mb: 2}}
            disablePortal
            options={countries}
            size="small"
            onChange={(event, newValue) => {
              props.onChange({target:{name:'country_id',value:newValue.id}})
            }}
            renderInput={(params) =>
              <TextField
                {...params}

                placeholder="Company country"
              />
            }
            value={currentCountryLabel()}
          />
          <TextField label={t('VAT number')} size="small" fullWidth sx={{mb: 2}}
                     type="text" id="vat_number" name="vat_number" required
                     onChange={props.onChange} value={props.giftcard.vat_number || ''}
          />
        </>}
        <Button className="giftcard_button blue" variant="contained" type="button" fullWidth
                disabled={loading}
                onClick={e => {
                  props.onChange({target: {name: 'delivery_form_finish'}})
                  setLoading(true)
                }}>{t('Proceed to payment')}</Button>
      </Grid>
      <Grid item xs={12} md={3}></Grid>
    </Grid>
  </>);
}
