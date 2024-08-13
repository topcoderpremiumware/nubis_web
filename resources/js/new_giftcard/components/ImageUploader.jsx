import React, {useState} from 'react';
import "./../App.scss";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {useTranslation} from "react-i18next";

export default function ImageUploader(props) {
  const {t} = useTranslation();
  const [preview, setPreview] = useState('');

  const onChange = (e) => {
    props.onChange(e.target.files[0])
    setPreview(URL.createObjectURL(e.target.files[0]))
  }

  const handleDrop = (e) => {
    e.preventDefault();
    props.onChange(e.dataTransfer.files[0])
    setPreview(URL.createObjectURL(e.dataTransfer.files[0]))
  }

  const handleDragOver = (e) => {
    e.preventDefault();
  }

  return (<>
    <div className="image_uploader_wrapper"
         onDrop={handleDrop}
         onDragOver={handleDragOver}>
      <div className="image_uploader_icon"><AddCircleOutlineIcon/></div>
      <div className="image_uploader_description">{t('Drag and Drop or click to choose a file')}</div>
      <div className="image_uploader_size">{t('Max file size: 1MB')}</div>
      {preview && <img src={preview} alt="" />}
      <input accept="image/*" onChange={onChange} type="file"/>
    </div>
  </>);
}
