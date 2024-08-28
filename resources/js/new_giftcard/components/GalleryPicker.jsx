import React, {useState} from 'react';
import "./Gallery.scss";
import {Grid} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export default function GalleryPicker(props) {
  const [selected, setSelected] = useState('')

  const getPicture = (purpose, is_array= false) => {
    let picture = props.pictures.filter(el => el.purpose === purpose)
    if(picture.length === 0) return ''
    if(is_array){
      return picture
    }else{
      return picture[0].url
    }
  }

  const onChange = (key) => {
    setSelected(key)
    let file = getPicture('giftcard_gallery',true)[key]
    props.onChange(file.url)
  }

  return (<Grid container spacing={2}>
    {getPicture('giftcard_gallery',true).length > 0 && getPicture('giftcard_gallery',true).map((item,key) => {
      return <Grid item xs={6} className="gallery_picker_item" key={key} onClick={() => onChange(key)}>
        <div className="gallery_picker_image" style={{"--image-background": `url('${item.url}')`}}></div>
        <div className={`gallery_picker_checked ${selected === key ? 'active' : ''}`}>{selected === key ? <CheckCircleOutlineIcon/> : <RadioButtonUncheckedIcon/>}</div>
      </Grid>
    })}
  </Grid>);
}
