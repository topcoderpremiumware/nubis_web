import './NewGiftCardPopup.scss';

import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import eventBus from '../../../../eventBus';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl, Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select, Switch
} from "@mui/material";
import ImageUploader from "../../../../new_giftcard/components/ImageUploader";
import GalleryPicker from "../../../../new_giftcard/components/GalleryPicker";
import {getBase64FromFile, getBase64FromUrl} from "../../../../helper";
import moment from "moment/moment";

export default function NewGiftCardPopup({ open, handleClose }) {
  const { t } = useTranslation();
  const [type, setType] = useState('amount')
  const [count, setCount] = useState(1)
  const [amount, setAmount] = useState(100)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [receiverName, setReceiverName] = useState([])
  const [receiverEmail, setReceiverEmail] = useState([])
  const [isReceiver, setIsReceiver] = useState(false)
  const [separately, setSeparately] = useState(false)
  const [error, setError] = useState('')
  const [experiences, setExperiences] = useState([])
  const [experience, setExperience] = useState(null)
  const [greetings, setGreetings] = useState('')
  const [backgroundImage, setBackgroundImage] = useState('')
  const [qtyTogether, setQtyTogether] = useState(false)
  const [uploadImage,setUploadImage] = useState(false)
  const [pictures, setPictures] =  useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getExperiences()
    getPictures()
    eventBus.on("placeChanged", () => {
      getExperiences()
      getPictures()
    })
  },[])

  const onClose = () => {
    setCount(1)
    setAmount(100)
    setName('')
    setEmail('')
    setReceiverName([])
    setReceiverEmail([])
    setExperience('')
    setGreetings('')
    setIsReceiver(false)
    setBackgroundImage('')
    setQtyTogether(false)
    setError('')
    handleClose()
  }

  const onCreate = async () => {
    setLoading(true)
    try {
      const data = {
        place_id: localStorage.getItem('place_id'),
        quantity: count,
        qty_together: qtyTogether,
        name,
        email,
        initial_amount: amount,
        expired_at: moment().add(3,'years').format('YYYY-MM-DD HH:mm:00'),
        ...(isReceiver && {
          receiver_name: receiverName,
          receiver_email: receiverEmail
        }),
        experience_id: experience,
        greetings: greetings,
        background_image: backgroundImage
      }

      await axios.post(process.env.MIX_API_URL + '/api/giftcards_admin', data, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })

      setLoading(false)
      eventBus.dispatch("newGiftCard")
      onClose()
    } catch (err) {
      setLoading(false)
      setError(err.response.data.message)
    }
  }

  const getExperiences = async () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/giftcard_menus`).then(response => {
      setExperiences(response.data)
    }).catch(error => {
    })
  }

  const getPictures = () => {
    axios.get(`${process.env.MIX_API_URL}/api/files_many_purposes`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        purposes: ['giftcard_gallery'],
      },
    }).then((response) => {
      setPictures(response.data)
    }).catch((error) => {
      setPictures([])
    });
  }

  const onChange = (e) => {
    if(e.target.name === 'receiver_name'){
      let receiver_name = receiverName || []
      receiver_name[e.target.index] = e.target.value
      setReceiverName(prev => ([...receiver_name]))
    }
    if(e.target.name === 'receiver_email'){
      let receiver_email = receiverEmail || []
      receiver_email[e.target.index] = e.target.value
      setReceiverEmail(prev => ([...receiver_email]))
    }
  }

  const onGalleryPicked = async ({url}) => {
    let base64 = await getBase64FromUrl(url)
    setBackgroundImage(base64)
  }

  const onImageUploaded = async (file) => {
    let base64 = await getBase64FromFile(file)
    setBackgroundImage(base64)
  }

  const receiverForm = () => {
    let output = []
    for(let i=0;i<(separately ? count : 1);i++){
      output.push(<div key={i}>
        <TextField label={t('Receiver Name')} size="small" fullWidth sx={{mb: 2}}
                   type="text" id={`receiver_name[${i}]`} name={`receiver_name[${i}]`} required
                   onChange={e => onChange({
                     target:{
                       name: 'receiver_name',
                       value: e.target.value,
                       index: i
                     }
                   })}
                   value={receiverName?.[i] || ''}
        />
        <TextField label={t('Receiver Email')} size="small" fullWidth sx={{mb: 2}}
                   type="email" id={`receiver_email[${i}]`} name={`receiver_email[${i}]`} required
                   onChange={e => onChange({
                     target:{
                       name: 'receiver_email',
                       value: e.target.value,
                       index: i
                     }
                   })}
                   value={receiverEmail?.[i] || ''}
        />
      </div>)
    }
    return output
  }

  return (
    <div>
      <Dialog onClose={onClose} open={open} fullWidth maxWidth="lg"
              scroll="paper"
              PaperProps={{
                style: {
                  backgroundColor: "#F2F3F9",
                },
              }}
      >
        <DialogTitle sx={{m: 0, p: 2}}>
          <>{t('Create new gift card')}</>
          <IconButton onClick={handleClose} sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}><CloseIcon/></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div className="row mt-4">
            <div className="col-md-6">
              <FormControl size="small" fullWidth sx={{mb: 2}}>
                <InputLabel id="label_type">{t('Type')}</InputLabel>
                <Select label={t('Type')} value={type}
                        labelId="label_type" id="type" name="type"
                        onChange={ev => setType(ev.target.value)}>
                  <MenuItem value="amount">{t('Amount')}</MenuItem>
                  <MenuItem value="experience">{t('Experience')}</MenuItem>
                </Select>
              </FormControl>

              {type === 'experience' &&
                <FormControl size="small" fullWidth sx={{mb: 2}}>
                  <InputLabel id="label_experience">{t('Experience')}</InputLabel>
                  <Select label={t('Experience')}
                          labelId="label_experience" id="experience" name="experience"
                          onChange={ev => {
                            setAmount(experiences.find(el => el.id === ev.target.value).price)
                            setExperience(ev.target.value)
                            }
                          }>
                    {experiences.map((exp,key) => {
                      return <MenuItem key={key} value={exp.id}>{exp.name}</MenuItem>
                    })}
                  </Select>
                </FormControl>}

              <TextField label={t('Count')} size="small" fullWidth sx={{mb: 2}}
                         type="number" id="count" name="count"
                         InputProps={{inputProps: {min: 1, max: 100}}}
                         value={count}
                         onChange={ev => setCount(ev.target.value)}/>

              {(count > 1 && type === 'experience') && <FormControlLabel
                label={t('Quantity in one gift card')} labelPlacement="end" sx={{mb:2}}
                control={
                  <Switch onChange={ev => setQtyTogether(ev.target.checked)}
                          checked={qtyTogether || false} />
                }/>}

              {type === 'amount' &&
                <TextField label={t('Amount')} size="small" fullWidth sx={{mb: 2}}
                           type="number" id="amount" name="amount"
                           InputProps={{inputProps: {min: 100, max: 10000}}}
                           value={amount}
                           onChange={ev => setAmount(ev.target.value)}/>}

              <TextField label={t('Greetings')} size="small" fullWidth sx={{mb: 2}}
                         type="text" id="greetings" name="greetings"
                         onChange={ev => setGreetings(ev.target.value)} value={greetings}
                         multiline rows="3"
              />

              <FormControlLabel sx={{mb: 2}}
                                control={
                                  <Checkbox
                                    color="default"
                                    size="small"
                                    checked={isReceiver}
                                    onChange={ev => setIsReceiver(ev.target.checked)}
                                  />
                                }
                                label={t("Send to RECEIVERS e-mail")}
              />

              <TextField label={t('Name')} size="small" fullWidth sx={{ mb: 2 }}
                         type="text" id="name" name="name"
                         value={name}
                         onChange={ev => setName(ev.target.value)} />
              <TextField label={t('Email')} size="small" fullWidth sx={{ mb: 2 }}
                         type="email" id="email" name="email"
                         value={email}
                         onChange={ev => setEmail(ev.target.value)} />

              {isReceiver && <>
                <FormControlLabel sx={{mb: 2}}
                                  control={
                                    <Checkbox
                                      color="default"
                                      size="small"
                                      checked={separately}
                                      onChange={ev => setSeparately(ev.target.checked)}
                                    />
                                  }
                                  label={t("Set email for each item separately")}
                />
                {receiverForm()}
              </>}
            </div>
            <div className="col-md-6">
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6} md={6}>
                  <Button variant={uploadImage ? 'outlined' : 'contained'}
                          type="button" fullWidth onClick={e => {
                    if (uploadImage) setUploadImage(false)
                  }}>{t('Our Image')}</Button>
                </Grid>
                <Grid item xs={6} md={6}>
                  <Button variant={uploadImage ? 'contained' : 'outlined'}
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
                <GalleryPicker pictures={pictures} onChange={onGalleryPicked}/>
              }
            </div>
          </div>

          {error && <p className='error'>{error}</p>}
        </DialogContent>
        <DialogActions sx={{p:2}}>
          <Button
            variant="contained"
            type="button"
            onClick={onCreate}
            disabled={loading}
          >{t('Create')}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
