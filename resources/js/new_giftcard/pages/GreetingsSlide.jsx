import React, {useEffect, useState} from 'react';
import './../../i18nextConf';
import "./../App.scss";
import {Button, Grid, TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import Box from "@mui/material/Box";
import VisibilityIcon from '@mui/icons-material/Visibility';
import GalleryPicker from "../components/GalleryPicker";
import {getBase64FromFile, getBase64FromUrl} from "../../helper";
import ImageUploader from "../components/ImageUploader";
import eventBus from "../../eventBus";

export default function GreetingsSlide(props) {
  const {t} = useTranslation();
  const [uploadImage,setUploadImage] = useState(false)

  useEffect( () => {
    if(!props.giftcard.background_image){
      let pics = pictures().filter(el => el.purpose === 'giftcard_gallery')
      if(pics.length > 0) onGalleryPicked({url:pics[0].url,index:0})
    }
  }, [props])

  const onGalleryPicked = async (data) => {
    let base64 = await getBase64FromUrl(data.url)
    props.onChange({target:{name: 'background_image',value: base64,index: data.index}})
  }

  const onImageUploaded = async (file) => {
    let base64 = await getBase64FromFile(file)
    props.onChange({target:{name: 'background_image',value: base64}})
  }

  const pictures = () => {
    if(props.giftcard.experience){
      return [{purpose: 'giftcard_gallery',url: props.giftcard.experience.image_url},...props.pictures]
    }else{
      let pictures = props.pictures.filter(el => el.purpose === 'giftcard_on_amount')
      if(pictures.length > 0){
        return [{purpose: 'giftcard_gallery',url: pictures[0].url},...props.pictures]
      }
    }
  }

  return (<>
    <Box className="slide_title" style={{marginTop: '48px',textAlign:'center'}} sx={{mb: 1}}>{t('Customise')}</Box>
    <div style={{
      textAlign: 'center',
      marginBottom: '48px',
      color: '#495057'
    }}>{t('Select whether you want to personalise with image and greeting.')}</div>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} style={{display: 'flex',flexDirection: 'column'}}>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6} md={6}>
            <Button className={`giftcard_button ${!uploadImage ? 'blue' : ''}`} variant={uploadImage ? 'outlined' : 'contained'}
                    type="button" fullWidth onClick={e => {
                      if (uploadImage) setUploadImage(false)
                    }}>{t('Our Image')}</Button>
          </Grid>
          <Grid item xs={6} md={6}>
            <Button className={`giftcard_button ${uploadImage ? 'blue' : ''}`} variant={uploadImage ? 'contained' : 'outlined'}
                    type="button" fullWidth onClick={e => {
                      if (!uploadImage) setUploadImage(true)
                    }}>{t('Upload Image')}</Button>
          </Grid>
        </Grid>
        {uploadImage ?
          <div className="option_item">
            <div className="label_title">{t('Upload picture')}</div>
            <ImageUploader onChange={onImageUploaded}/>
          </div>
          :
          <GalleryPicker pictures={pictures()} onChange={onGalleryPicked} selectedIndex={props.giftcard.background_image_index}/>
        }
      </Grid>
      <Grid item xs={12} md={6} mt={8}>
        <div className="option_item">
          <div className="label_title">{t('Greetings')}</div>
          <TextField size="small" fullWidth sx={{mb: 2}} multiline rows="12"
                     type="text" id="greetings" name="greetings" required
                     onChange={props.onChange} value={props.giftcard.greetings || ''}
          />
          <Grid container spacing={{xs:2, md:3}}>
            <Grid item xs={6} md={6}>
              <Button className="giftcard_button blue" variant="contained" type="button" fullWidth
                  onClick={e => props.onChange({target: {name: 'greetings_finish'}})}>{t('Next')}</Button>
            </Grid>
            <Grid item xs={6} md={6}>
              <Button className="giftcard_button" variant="outlined" fullWidth
                      onClick={e => eventBus.dispatch('seeExample',props.giftcard)}>{t('See examples')}&nbsp;&nbsp;<VisibilityIcon/></Button>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  </>);
}
