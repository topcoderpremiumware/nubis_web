import React, {useEffect, useState} from "react";
import  './CustomBookingLength.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import {
  Button, CircularProgress,
  IconButton, Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomBookingLengthEditPopup from "./CustomBookingLengthEditPopup"
import Moment from "moment";
import {wait} from "@testing-library/user-event/dist/utils";

export default function CustomBookingLength() {
  const {t} = useTranslation();

  const [customBookingLength, setCustomBookingLength] = useState([])
  const [areas, setAreas] = useState([])
  const [editPopupOpened, setEditPopupOpened] = useState(false)
  const [selectedLength, setSelectedLength] = useState({})
  const [loading, setLoading] = useState(true)

  const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  useEffect(async () => {
    await getAreas()
    await getCustomBookingLength()
    eventBus.on("placeChanged", async () => {
      await getAreas()
      await getCustomBookingLength()
    })
  }, [])

  const getCustomBookingLength = async () => {
    setLoading(true)
    await axios.get(`${process.env.MIX_APP_URL}/api/places/${localStorage.getItem('place_id')}/custom_booking_lengths`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setCustomBookingLength(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  const getAreas = async () => {
    await axios.get(`${process.env.MIX_APP_URL}/api/places/${localStorage.getItem('place_id')}/areas?all=1`).then(response => {
      setAreas(response.data)
    }).catch(error => {
    })
  }

  const updateCustomLength = async (customLength) => {
    console.log('customLength', customLength)
    let url = `${process.env.MIX_APP_URL}/api/custom_booking_lengths`
    if (customLength.hasOwnProperty('id')) {
      url = `${process.env.MIX_APP_URL}/api/custom_booking_lengths/${customLength.id}`
    }

    return await axios.post(url, generateFormData(customLength), {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      getCustomBookingLength()
      setEditPopupOpened(false)
      eventBus.dispatch("notification", {type: 'success', message: 'Booking length saved successfully'});
      return true
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
      return false
    })
  }

  const generateFormData = (data) => {
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (['week_days','month_days','area_ids'].includes(key)) {
        if(value.length){
          value.forEach(i => {
            formData.append(key+'[]', i)
          })
        }else{
          formData.append(key, null)
        }
      }else if(['spec_dates','time_intervals'].includes(key)) {
        if(value.length){
          value.forEach((i,index) => {
            for (const [data_key, data_value] of Object.entries(i)) {
              formData.append(key + '['+index+']['+data_key+']', data_value)
            }
          })
        }else{
          formData.append(key, null)
        }
      }else if(key == 'labels'){
        for (const [lang_key, lang_value] of Object.entries(value)) {
          for (const [data_key, data_value] of Object.entries(lang_value)) {
            formData.append(key+'['+lang_key+']['+data_key+']', data_value)
          }
        }
      }else{
        formData.append(key, value)
      }
    }
    return formData
  }

  const openEditPopup = (time) => {
    if (!time) time = {
      place_id: localStorage.getItem('place_id'),
      name: '',
      length: 0,
      active: 1,
      start_date: Moment().format('YYYY-MM-DD'),
      end_date: Moment().format('YYYY-MM-DD'),
      max: 999,
      min: 0,
      priority: 1,
      labels: {},
      month_days: [],
      week_days: [],
      spec_dates: [],
      time_intervals: [],
      area_ids: []
    }
    setSelectedLength(time)
    setEditPopupOpened(true)
  }

  const deleteCustomLength = (customLength) => {
    if (customLength.hasOwnProperty('id')) {
      if (window.confirm(t('Are you sure you want to delete this booking length?'))) {
        axios.delete(process.env.MIX_APP_URL + '/api/custom_booking_lengths/' + customLength.id, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          getCustomBookingLength()
          eventBus.dispatch("notification", {type: 'success', message: 'Booking length deleted successfully'});
        }).catch(error => {
          eventBus.dispatch("notification", {type: 'error', message: error.message});
          console.log('Error', error)
        })
      }
    }
  }

  return (
    <div className='pages__container'>
      <h2>{t('Custom Booking Length')}</h2>
      <div className="container-fluid">
        <div className="row">
          {loading ? <div><CircularProgress/></div> : <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small">{t('Name')}</TableCell>
                  <TableCell size="small">{t('Priority')}</TableCell>
                  <TableCell size="small" style={{minWidth: '110px'}}>{t('Start date')}</TableCell>
                  <TableCell size="small" style={{minWidth: '110px'}}>{t('End date')}</TableCell>
                  <TableCell size="small" style={{minWidth: '110px'}}>{t('Created')}</TableCell>
                  <TableCell size="small" style={{minWidth: '110px'}}>{t('Modified')}</TableCell>
                  <TableCell size="small">{t('Active')}</TableCell>
                  <TableCell size="small" style={{minWidth: '100px'}}>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customBookingLength.map((item, key) => {
                  return <StyledTableRow key={key}>
                    <TableCell size="small">{item.name}</TableCell>
                    <TableCell size="small">{item.priority}</TableCell>
                    <TableCell size="small">{Moment(item.start_date).format('YYYY-MM-DD')}</TableCell>
                    <TableCell size="small">{Moment(item.end_date).format('YYYY-MM-DD')}</TableCell>
                    <TableCell size="small">{Moment(item.created_at).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell size="small">{Moment(item.updated_at).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell size="small">{item.active ? t('Yes') : t('No')}</TableCell>
                    <TableCell size="small">
                      <IconButton onClick={e => {
                        openEditPopup(item)
                      }} size="small">
                        <EditIcon fontSize="small"/>
                      </IconButton>
                      <IconButton onClick={e => {
                        deleteCustomLength(item)
                      }} size="small">
                        <DeleteIcon fontSize="small"/>
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                })}
              </TableBody>
            </Table>
          </TableContainer>}
        </div>
      </div>
      <Stack spacing={2} sx={{mt: 2}} direction="row">
        <Button variant="contained" type="button" onClick={e => {
          openEditPopup(false)
        }}>{t('New')}</Button>
      </Stack>
      <CustomBookingLengthEditPopup
        open={editPopupOpened}
        lengths={selectedLength}
        areas={areas}
        onChange={updateCustomLength}
        onClose={e => {
          setEditPopupOpened(false)
        }}
      />
    </div>
  );
};
