import React, {useEffect, useState} from "react";
import  './Roles.scss';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import 'moment/locale/da'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControl,
  Grid,
  IconButton, InputLabel, MenuItem, Select, TextField,
} from "@mui/material";

export default function RoleEditPopup(props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('')
  const [role, setRole] = useState({})
  const [roles, setRoles] = useState({})

  useEffect(() => {
    getRoles()
    if(props.user.hasOwnProperty('email')){
      setEmail(props.user.email)
      setRole(props.user.role)
    }
  },[props])

  const getRoles = () => {
    axios.get(`${process.env.MIX_API_URL}/api/roles`,{
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }).then(response => {
      setRoles(response.data)
    }).catch(error => {
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'email') setEmail(e.target.value)
    if(e.target.name === 'role') setRole(e.target.value)
  }

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = () => {
    props.onChange(email,role)
  }

  return (<>
    {props.user.hasOwnProperty('email') &&
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
        <Grid container spacing={2} sx={{pb: 2}}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Email')} size="small" fullWidth
                       type="email" id="email" name="email" required
                       onChange={onChange} value={email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl size="small" fullWidth>
              <InputLabel id="label_role">{t('Role')}</InputLabel>
              <Select label={t('Role')} value={role}
                      labelId="label_role" id="role" name="role"
                      onChange={onChange}>
                {roles.map((el,key) => {
                  return <MenuItem key={key} value={el.id}>{el.title}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          {['admin'].includes(window.role) &&
          <Grid item xs={12} sm={6}>
            <TextField label={t('PIN code')} size="small" fullWidth
                       type="text" disabled
                       value={props.user.pin}
                       InputProps={{
                         readOnly: true,
                       }}
            />
          </Grid>}
        </Grid>
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="outlined" onClick={handleClose}>{t('Cancel')}</Button>
        <Button variant="contained" onClick={handleSave}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>}
  </>);
};
