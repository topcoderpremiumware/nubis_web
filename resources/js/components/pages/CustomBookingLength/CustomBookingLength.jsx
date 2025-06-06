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
import { useNavigate } from "react-router-dom";
import {StyledTableRow} from "../../components/StyledTableRow";
import {generateFormData} from "../../../helper";

export default function CustomBookingLength() {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [customBookingLength, setCustomBookingLength] = useState([])
  const [areas, setAreas] = useState([])
  const [editPopupOpened, setEditPopupOpened] = useState(false)
  const [selectedLength, setSelectedLength] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(async () => {
    await getAreas()
    await getCustomBookingLength()
    function placeChanged(){
      getAreas().then(()=>{
        getCustomBookingLength()
      })
    }
    eventBus.on("placeChanged", placeChanged)
    return () => {
      eventBus.remove("placeChanged", placeChanged)
    }
  }, [])

  const getCustomBookingLength = async () => {
    setLoading(true)
    await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/custom_booking_lengths`, {
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
    await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/areas?all=1`).then(response => {
      setAreas(response.data)
    }).catch(error => {
    })
  }

  const updateCustomLength = async (customLength) => {
    console.log('customLength', JSON.stringify(customLength))
    let url = `${process.env.MIX_API_URL}/api/custom_booking_lengths`
    if (customLength.hasOwnProperty('id')) {
      url = `${process.env.MIX_API_URL}/api/custom_booking_lengths/${customLength.id}`
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

  // const generateFormData = (data) => {
  //   const formData = new FormData()
  //   for (const [key, value] of Object.entries(data)) {
  //     if (['week_days','month_days','area_ids'].includes(key)) {
  //       if(value.length){
  //         value.forEach(i => {
  //           formData.append(key+'[]', i)
  //         })
  //       }else{
  //         formData.append(key, null)
  //       }
  //     }else if(['spec_dates','time_intervals'].includes(key)) {
  //       if(value.length){
  //         value.forEach((i,index) => {
  //           for (const [data_key, data_value] of Object.entries(i)) {
  //             formData.append(key + '['+index+']['+data_key+']', data_value)
  //           }
  //         })
  //       }else{
  //         formData.append(key, null)
  //       }
  //     }else if(key == 'labels'){
  //       for (const [lang_key, lang_value] of Object.entries(value)) {
  //         for (const [data_key, data_value] of Object.entries(lang_value)) {
  //           formData.append(key+'['+lang_key+']['+data_key+']', data_value)
  //         }
  //       }
  //     }else if(key == 'payment_settings') {
  //       for (const [p_key, p_value] of Object.entries(value)) {
  //         formData.append(key + '[' + p_key + ']', p_value)
  //       }
  //     }else if(key == 'courses'){
  //       for (const [cIndex, c] of value) {
  //         formData.append(key+'['+cIndex+'][name]', c.name)
  //         for (const [pIndex, p] of c.products) {
  //           formData.append(key+'['+cIndex+'][products]['+pIndex+']', p.id)
  //         }
  //       }
  //     }else{
  //       formData.append(key, value)
  //     }
  //   }
  //   return formData
  // }

  // const generateFormData = (data,form = new FormData(), namespace = '') => {
  //   for (let key in data) {
  //     if (!data.hasOwnProperty(key)) continue;
  //
  //     const value = data[key];
  //     const formKey = namespace ? `${namespace}[${key}]` : key;
  //
  //     if (value instanceof Date) {
  //       form.append(formKey, value.toISOString());
  //     } else if (value instanceof File || value instanceof Blob) {
  //       form.append(formKey, value);
  //     } else if (typeof value === 'object' && value !== null) {
  //       if (Array.isArray(value)) {
  //         value.forEach((item, index) => {
  //           generateFormData(item, form, `${formKey}[${index}]`);
  //         });
  //       } else {
  //         generateFormData(value, form, formKey);
  //       }
  //     } else if (value !== undefined) {
  //       form.append(formKey, value);
  //     }
  //   }
  //
  //   return form;
  // }

  const openEditPopup = (time) => {
    if (!time) time = {
      place_id: localStorage.getItem('place_id'),
      name: '',
      length: 0,
      active: 1,
      start_date: Moment().utc().format('YYYY-MM-DD'),
      end_date: Moment().utc().format('YYYY-MM-DD'),
      max: 999,
      min: 0,
      priority: 1,
      labels: {},
      month_days: [],
      week_days: [],
      spec_dates: [],
      time_intervals: [],
      area_ids: [],
      min_time_before: 0
    }
    setSelectedLength(time)
    setEditPopupOpened(true)
  }

  const deleteCustomLength = (customLength) => {
    if (customLength.hasOwnProperty('id')) {
      if (window.confirm(t('Are you sure you want to delete this booking length?'))) {
        axios.delete(process.env.MIX_API_URL + '/api/custom_booking_lengths/' + customLength.id, {
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
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Menus setup')}</h2>
        <Button
          variant="contained"
          size="sm"
          type="button"
          onClick={() => navigate('/VideoGuides')}
        >{t('See Table Booking POS Academy')}</Button>
      </Stack>
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
                    <TableCell size="small">{Moment.utc(item.start_date).format('YYYY-MM-DD')}</TableCell>
                    <TableCell size="small">{Moment.utc(item.end_date).format('YYYY-MM-DD')}</TableCell>
                    <TableCell size="small">{Moment.utc(item.created_at).local().format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell size="small">{Moment.utc(item.updated_at).local().format('YYYY-MM-DD HH:mm')}</TableCell>
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
