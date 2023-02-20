import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import 'moment/locale/da'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton, TextField,
} from "@mui/material";

export default function AreaEditPopup(props) {
  const { t } = useTranslation();
  const [guide, setGuide] = useState([])

  useEffect(() => {
    if(props.guide.hasOwnProperty('title')){
      setGuide(props.guide)
    }
  },[props])

  const onChange = (e) => {
    setGuide(prev => ({...prev, [e.target.name]: e.target.value}))
  }

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = () => {
    props.onChange(guide)
  }

  return (<>
    {guide.hasOwnProperty('title') &&
    <Dialog onClose={handleClose} open={props.open} fullWidth maxWidth="md"
            scroll="paper"
            PaperProps={{
              style: {
                backgroundColor: "#F2F3F9",
              },
            }}
            >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <>&nbsp;</>
        <IconButton onClick={handleClose} sx={{
          position:'absolute',
          right:8,
          top:8,
          color:(theme) => theme.palette.grey[500],
          }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div className="row mt-3">
          <div className="col-lg-6">
            <div className="mb-3">
              <TextField label={t('Title')} size="small" fullWidth
                         type="text" id="title" name="title"
                         value={guide.title}
                         onChange={(e) => onChange(e)}/>
            </div>
            <div className="mb-3">
              <TextField label={t('YouTube id')} size="small" fullWidth
                         type="text" id="youtube_id" name="youtube_id"
                         value={guide.youtube_id}
                         onChange={(e) => onChange(e)}
                         helperText={<>https://www.youtube.com/watch?v=<b>cRV0O0kIGJg</b></>}/>

            </div>
            <div className="mb-3">
              <TextField label={t('Page url')} size="small" fullWidth
                         type="text" id="page_url" name="page_url"
                         value={guide.page_url}
                         onChange={(e) => onChange(e)}/>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="mb-3">
              <TextField label={t('Description')} size="small" fullWidth
                         type="text" id="description" name="description"
                         onChange={(e) => onChange(e)} value={guide.description}
                         multiline rows="3"/>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="outlined" onClick={handleClose}>{t('Cancel')}</Button>
        <Button variant="contained" onClick={handleSave}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>}
  </>);
};
