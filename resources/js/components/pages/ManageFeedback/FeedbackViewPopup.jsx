import React, {useEffect, useState} from "react";
import  './ManageFeedback.scss';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import Moment from 'moment';
import 'moment/locale/nl'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton, Rating, TextField,
} from "@mui/material";
import eventBus from "../../../eventBus";

export default function FeedbackViewPopup(props) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState([])

  useEffect(() => {
      setFeedback(props.feedback)
  },[props])

  const handleClose = () => {
    props.onClose()
  }

  const onChange = (e) => {
    if(e.target.name === 'reply') setFeedback(prev => ({...prev, reply: e.target.value}))
  }

  const handleSave = () => {
    axios.post(`${process.env.MIX_API_URL}/api/feedbacks/${feedback.id}/reply`, {
      reply: feedback.reply
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Feedback replied successfully'});
    }).catch(error => {
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          eventBus.dispatch("notification", {type: 'error', message: value});
        }
      } else if (error.response.status === 401) {
        eventBus.dispatch("notification", {type: 'error', message: 'Authorization error'});
      } else {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error.message)
      }
    })
  }

  const markFormat = (number) => {
    return number.toLocaleString("en",{minimumFractionDigits: 1})
  }

  return (<>
    {feedback.customer &&
    <Dialog onClose={handleClose} open={props.open} fullWidth maxWidth="xl"
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
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={6}>
            <h2>{t('Booking Information')}</h2>
            <p>{t('Restaurant')}: <strong>{feedback.place.name}</strong></p>
            <p>{t('Booking Date')}: <strong>{Moment(feedback.order.created_at).format('YYYY-MM-DD HH:mm')}</strong></p>
            <p>{t('Pax')}: <strong>{feedback.order.seats}</strong></p>
            <p>{t('Booking ID')}: <strong>{feedback.order.id}</strong></p>
            <p>{t('Area')}: <strong>{feedback.order.area.name}</strong></p>
            <p>{t('Current status')}: <strong>{feedback.order.status}</strong></p>
          </Grid>
          <Grid item xs={12} sm={6}>
            <h2>{t('Customer Information')}</h2>
            <p>{t('Name')}: <strong>{feedback.customer_name}</strong></p>
            <p>{t('Phone')}: <strong>{feedback.customer.phone}</strong></p>
            <p>{t('Email')}: <strong>{feedback.customer.email}</strong></p>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={6}>
            <h2>{t('Ratings')}</h2>
            <p style={{display: 'flex', alignItems: 'center'}}>{t('Food')}:
              <span style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                <Rating value={feedback.food_mark} precision={0.5} readOnly/>({markFormat(feedback.food_mark)})
              </span>
            </p>
            <p style={{display: 'flex', alignItems: 'center'}}>{t('Service')}:
              <span style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                <Rating value={feedback.service_mark} precision={0.5} readOnly/>({markFormat(feedback.service_mark)})
              </span>
            </p>
            <p style={{display: 'flex', alignItems: 'center'}}>{t('Ambiance')}:
              <span style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                <Rating value={feedback.ambiance_mark} precision={0.5} readOnly/>({markFormat(feedback.ambiance_mark)})
              </span>
            </p>
            <p style={{display: 'flex', alignItems: 'center'}}>{t('Overall experience')}:
              <span style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                <Rating value={feedback.experience_mark} precision={0.5} readOnly/>({markFormat(feedback.experience_mark)})
              </span>
            </p>
            <p style={{display: 'flex', alignItems: 'center'}}>{t('Value for money')}:
              <span style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                <Rating value={feedback.price_mark} precision={0.5} readOnly/>({markFormat(feedback.price_mark)})
              </span>
            </p>
            <p style={{display: 'flex', alignItems: 'center'}}>{t('Total Average Rating')}:
              <span style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                <Rating value={feedback.average_mark} precision={0.5} readOnly/>({markFormat(feedback.average_mark)})
              </span>
            </p>
            <p style={{display: 'flex', alignItems: 'center'}}>{t('Would recommend')}:
              <span style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                {feedback.is_recommend ? t('Yes') : t('No')}
              </span>
            </p>
            <p style={{display: 'flex', alignItems: 'center'}}>{t('Reviewed')}:
              <span style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                {Moment(feedback.created_at).format('YYYY-MM-DD HH:mm')}
              </span>
            </p>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={6}>
            <h2>{t('Review')}</h2>
            <p>{feedback.comment}</p>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={6}>
            <h2>{t('Reply')}</h2>
            <TextField label={t('Reply')} size="small" fullWidth
                       type="text" id="labels_reply" name="reply"
                       onChange={onChange}
                       multiline
                       maxRows={4}
                       value={feedback.reply} />
            <Button sx={{mt: 2}} variant="contained" onClick={handleSave}>{t('Save')}</Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="outlined" onClick={handleClose}>{t('Cancel')}</Button>
      </DialogActions>
    </Dialog>}
  </>);
};
