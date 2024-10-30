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
  Grid,
  IconButton, TextField,
} from "@mui/material";

export default function TerminalEditPopup(props) {
  const { t } = useTranslation();
  const [terminal, setTerminal] = useState({})

  useEffect(() => {
    if(props.terminal.hasOwnProperty('serial')){
      setTerminal(props.terminal)
    }
  },[props])

  const onChange = (e) => {
    if(e.target.name === 'serial') setTerminal(prev => ({...prev, serial: e.target.value}))
    if(e.target.name === 'url') setTerminal(prev => ({...prev, url: e.target.value}))
  }

  const handleClose = () => {
    props.onClose()
  }
  const handleSave = () => {
    props.onChange(terminal)
  }

  return (<>
    {terminal.hasOwnProperty('serial') &&
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
            <TextField label={t('Serial')} size="small" fullWidth
                       type="text" id="serial" name="serial" required
                       onChange={onChange} value={terminal.serial}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('Url')} size="small" fullWidth
                       type="text" id="url" name="url" required
                       onChange={onChange} value={terminal.url}
                       helperText={`${t('Example')}: http://192.168.1.10:11001`}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{p:2}}>
        <Button variant="outlined" onClick={handleClose}>{t('Cancel')}</Button>
        <Button variant="contained" onClick={handleSave}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>}
  </>);
};
