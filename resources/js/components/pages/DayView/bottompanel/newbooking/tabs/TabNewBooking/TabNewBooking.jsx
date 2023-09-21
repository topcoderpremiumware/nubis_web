import React, {useEffect, useState} from 'react'
import './TabNewBooking.scss'

import {
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel, IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField
} from "@mui/material";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import Moment from "moment";
import {useTranslation} from "react-i18next";
import eventBus from "../../../../../../../eventBus";
import axios from 'axios';
import moment from 'moment';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css'
import GuestTables from "./tables/GuestTables";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TabNewBooking(props) {
  const {t} = useTranslation();

  const [order, setOrder] = React.useState({})
  const [selectedTables, setSelectedTables] = React.useState([])
  const [customers, setCustomers] = React.useState([])
  const [areas, setAreas] = React.useState([])
  const [times, setTimes] = React.useState([])
  const [tables, setTables] = React.useState([])
  const [isWalkIn, setIsWalkIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [documents, setDocuments] = React.useState([])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)

        // get areas
        await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/areas?all=1`).then(response => {
          setAreas(response.data)
        })
        // get customers
        await axios.get(`${process.env.MIX_API_URL}/api/customers/all`, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          setCustomers(response.data)
        })
      } catch (err) {
        console.log('err', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (Object.keys(props.order).length){
      setOrder(props.order)
      if(!props.order.customer_id) {
        setIsWalkIn(true)
      }
    }
    if(props.order.hasOwnProperty('id') && props.order.id){
      getDocuments()
    }
  }, [props])

  useEffect(() => {
    if(!order || !tables.length) return
    setSelectedTables(getSelectedTables())
  }, [tables])

  useEffect(async () => {
    if(Object.keys(order).length) {
      getTimes()
      getTables()
    }
  }, [order.area_id, order.seats, order.reservation_time])

  const getTimes = () => {
    axios.get(`${process.env.MIX_API_URL}/api/work_time`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        area_id: order.area_id,
        seats: order.seats,
        date: Moment.utc(order.reservation_time).utc().format('YYYY-MM-DD'),
        admin: true
      }
    }).then(response => {
      let data = response.data
      if(order.hasOwnProperty('created_at')){
        data.push(order.reservation_time)
      }
      setTimes(data)
    }).catch(error => {
      let data = []
      if(order.hasOwnProperty('created_at')){
        data.push(order.reservation_time)
      }
      setTimes(data)
    })
  }

  const getTables = () => {
    axios.get(`${process.env.MIX_API_URL}/api/free_tables`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        area_id: order.area_id,
        seats: order.seats,
        reservation_time: Moment.utc(order.reservation_time).utc().format('YYYY-MM-DD HH:mm:ss'),
        length: order.length
      }
    }).then(response => {
      let data = []
      for (const tableplan in response.data) {
        for (const index in response.data[tableplan]) {
          data.push({...response.data[tableplan][index], tableplan_id:tableplan})
        }
      }
      if(order.hasOwnProperty('table_ids') && order.table_ids.length > 0){
        order.table_ids.forEach(t => {
          data.push({number: t, seats: 0, tableplan_id: order.tableplan_id})
        })
      }
      console.log('tables',data)
      setTables(data)
    }).catch(error => {
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'date') setOrder(prev => (
      {
        ...prev,
        reservation_time: e.target.value + ' ' + Moment.utc(prev.reservation_time).format('HH:mm:00')
      }
    ))
    if(e.target.name === 'time') setOrder(prev => (
      {
        ...prev,
        reservation_time: Moment.utc(prev.reservation_time).format('YYYY-MM-DD') + ' ' + Moment.utc(e.target.value,'HH:mm').format('HH:mm:00') // changed to utc
      }
    ))
    if(e.target.name === 'area_id') setOrder(prev => ({...prev, area_id: e.target.value}))
    if(e.target.name === 'seats') setOrder(prev => ({...prev, seats: e.target.value}))
    if(e.target.name === 'length') setOrder(prev => ({...prev, length: e.target.value}))
    if(e.target.name === 'table_ids') setOrder(prev => ({...prev, table_ids: getTableIds(e.target.value)}))
    if(e.target.name === 'comment') setOrder(prev => ({...prev, comment: e.target.value}))
    if(e.target.name === 'status') setOrder(prev => ({...prev, status: e.target.value}))
    if(e.target.name === 'is_take_away') setOrder(prev => ({...prev, is_take_away: e.target.checked}))
    if(e.target.name === 'customer_first_name') setOrder(prev => ({...prev, customer: {
      ...prev.customer, first_name: e.target.value
    }}))
    if(e.target.name === 'customer_last_name') setOrder(prev => ({...prev, customer: {
      ...prev.customer, last_name: e.target.value
    }}))
    if(e.target.name === 'customer_email') setOrder(prev => ({...prev, customer: {
      ...prev.customer, email: e.target.value
    }}))
    if(e.target.name === 'customer_zip_code') setOrder(prev => ({...prev, customer: {
      ...prev.customer, zip_code: e.target.value
    }}))
    if(e.target.name === 'customer_language') setOrder(prev => ({...prev, customer: {
        ...prev.customer, language: e.target.value
      }}))
    if(e.target.name === 'customer_allow_send_emails') setOrder(prev => ({...prev, customer: {
        ...prev.customer, allow_send_emails: e.target.checked
      }}))
    if(e.target.name === 'customer_allow_send_news') setOrder(prev => ({...prev, customer: {
        ...prev.customer, allow_send_news: e.target.checked
      }}))
  }

  const seatsOptions = () => {
    let output = []
    for (let i=1;i<=100;i++){
      output.push({id:i,name:i})
    }
    return output
  }

  const lengthOptions = () => {
    let output = []
    for (let i=15;i<=1500;i+=15){
      output.push({id:i,name:i+' min'})
    }
    return output
  }

  const timeOptions = () => {
    return times.map(el => {
      return Moment.utc(el).format('HH:mm') // removed local
    })
  }

  const tablesOptions = () => {
    return tables.map((el,index) => {
      return {id:index, name: 'Table '+el.number+' ('+el.seats+' pax)'}
    })
  }

  const getTableIds = (data) => {
    let result = []
    let tableplan_id = ''
    setSelectedTables(data)
    console.log('tables',tables)
    data.forEach(index => {
      result.push(tables?.[index]?.number)
      tableplan_id = tables?.[index]?.tableplan_id
    })
    console.log('table result',result)
    setOrder(prev => ({...prev, tableplan_id: tableplan_id}))
    return result
  }

  const getSelectedTables = () => {
    let result = []
    order.table_ids.forEach(id => {
      let index = tables.findIndex(el => {
        return (el.tableplan_id == order.tableplan_id && el.number == id)
      })
      result.push(index)
    })
    return result
  }

  const setTableOrder = (data) => {
    setOrder(prev => ({
      ...prev,
      customer_id: data?.id || null,
      customer: {
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        zip_code: data.zip_code || '',
        language: data.language || '',
        allow_send_emails: data.allow_send_emails || false,
        allow_send_news: data.allow_send_news || false,
      }
    }))
  }

  const createOrder = async () => {
    const { customer, customer_id, ...rest } = order
    let newCustomerId = ''
    if(!customer_id && !isWalkIn) {
      try {
        let customer_response
        if(customer.email){
          customer_response = await axios.get(`${process.env.MIX_API_URL}/api/check_customer?email=${customer.email}`, {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token')
            }
          })
        }
        if(customer.email && customer_response.hasOwnProperty('data') && customer_response.data.hasOwnProperty('id')){
          newCustomerId = customer_response.data.id
        }else{
          const response = await axios.post(`${process.env.MIX_API_URL}/api/customers/register`, {
            ...customer,
            password: '12345678',
            password_confirmation: '12345678',
          })
          newCustomerId = response.data.customer.id
        }
      } catch(err) {
        setError(err.response.data.message)
        return
      }
    }
    try {
      let order_request = order?.id ? `${process.env.MIX_API_URL}/api/orders/${order.id}` : `${process.env.MIX_API_URL}/api/orders`
      await axios.post(order_request, {
          ...rest,
          ...(!isWalkIn && {customer, customer_id: customer_id || newCustomerId}),
          reservation_time: moment.utc(order.reservation_time).utc().format('YYYY-MM-DD HH:mm:ss'),
          timezone_offset: new Date().getTimezoneOffset()*-1
        }, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }
      )

      eventBus.dispatch('orderEdited')
      props.handleClose()
    } catch (err) {
      setError(err.response.data.message)
    }
  }

  const deleteOrder = async () => {
    try {
      axios.delete(`${process.env.MIX_API_URL}/api/orders/${order.id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(() => {
        eventBus.dispatch('orderEdited')
        props.handleClose()
      })
    } catch (err) {
      setError(err.response.data.message)
    }
  }

  const toogleWalkIn = () => {
    setTableOrder({ first_name: isWalkIn ? '' : 'Walk In' })
    setIsWalkIn(prev => !prev)
  }

  const addDocument = (e) => {
    if(e.target.files && e.target.files.length > 0){
      let formData = new FormData()
      formData.append('place_id', localStorage.getItem('place_id'))
      formData.append('file', e.target.files[0])
      axios.post(`${process.env.MIX_API_URL}/api/files/order_${props.order.id}_${Moment().valueOf()}`, formData,{
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        getDocuments()
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
  }
  const getDocuments = () => {
    axios.get(`${process.env.MIX_API_URL}/api/files_find`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        purpose: `order_${props.order.id}_`,
      },
    }).then((response) => {
      setDocuments(response.data)
    }).catch((error) => {
      setDocuments([])
    });
  }

  const removeDocument = (id) => {
    if (window.confirm(t('Are you sure you want to delete this document?'))) {
      axios.delete(process.env.MIX_API_URL + '/api/files/' + id, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        getDocuments()
        eventBus.dispatch("notification", {type: 'success', message: 'Document deleted successfully'});
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
  }

  return (
    loading ? <div><CircularProgress/></div> :
      <div className="row pt-3 TabNewBooking__container">
        <div className="col-md-4">
          <FormControl size="small" fullWidth className="datePickerFullWidth" sx={{mb:2}}>
            <InputLabel htmlFor="date" shrink>{t('Date')}</InputLabel>
            <DatePicker
              dateFormat='LLLL dd yyyy'
              selected={ new Date(order.reservation_time || new Date()) } id="date"
              onSelect={e => {
                onChange({target: {name: 'date', value: Moment.utc(e).format('YYYY-MM-DD')}})
              }}
              onChange={e => {
                onChange({target: {name: 'date', value: Moment.utc(e).format('YYYY-MM-DD')}})
              }}
            />
          </FormControl>
          <FormControl size="small" fullWidth sx={{mb:2}}>
            <InputLabel id="label_area_id">{t('Area')}</InputLabel>
            <Select label={t('Area')} value={order.area_id || ''} required
                    labelId="label_area_id" id="area_id" name="area_id"
                    onChange={onChange}>
              {areas.map((el, key) => {
                return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
              })}
            </Select>
          </FormControl>
          <div className="row">
            <div className="col-6">
              <FormControl size="small" fullWidth sx={{mb:2}}>
                <InputLabel id="label_seats">{t('Seats')}</InputLabel>
                <Select label={t('Seats')} value={order.seats || ''} required
                        labelId="label_seats" id="seats" name="seats"
                        onChange={onChange}>
                  {seatsOptions().map((el, key) => {
                    return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </div>
            <div className="col-6">
              <FormControl size="small" fullWidth sx={{mb:2}}>
                <InputLabel id="label_length">{t('Length')}</InputLabel>
                <Select label={t('Length')} value={order.length || ''} required
                        labelId="label_length" id="length" name="length"
                        onChange={onChange}>
                  {lengthOptions().map((el, key) => {
                    return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <FormControl size="small" fullWidth sx={{mb:2}}>
                <InputLabel id="label_time">{t('Time')}</InputLabel>
                <Select label={t('Time')} value={Moment.utc(order.reservation_time).format('HH:mm') || ''} required
                        labelId="label_time" id="time" name="time"
                        onChange={onChange}>
                  {timeOptions().map((el, key) => {
                    return <MenuItem key={key} value={el}>{el}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </div>
            <div className="col-6">
              <FormControl size="small" fullWidth sx={{mb:2}}>
                <InputLabel id="label_tables">{t('Tables')}</InputLabel>
                <Select label={t('Tables')} value={selectedTables} required
                        labelId="label_table_ids" id="table_ids" name="table_ids" multiple
                        onChange={onChange}>
                  {tablesOptions().map((el, key) => {
                    return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </div>
          </div>
          <TextField label={t('Note')} size="small" fullWidth multiline rows="2" sx={{mb:2}}
                    type="text" id="comment" name="comment"
                    onChange={onChange}
                    value={order.comment}/>
          <FormControl size="small" fullWidth sx={{mb:2}}>
            <InputLabel id="label_status">{t('Status')}</InputLabel>
            <Select label={t('Language')} value={order.status}
                    labelId="label_status" id="status" name="status"
                    onChange={onChange}>
              <MenuItem value="arrived">{t('Arrived')}</MenuItem>
              <MenuItem value="waiting">{t('Waiting')}</MenuItem>
              <MenuItem value="pending">{t('Pending')}</MenuItem>
              <MenuItem value="confirmed">{t('Confirmed')}</MenuItem>
              <MenuItem value="no_show">{t('No show')}</MenuItem>
              <MenuItem value="completed">{t('Completed')}</MenuItem>
            </Select>
          </FormControl>
          {/* <FormControlLabel label={t('Take away')} labelPlacement="start" sx={{mb:2}}
                            control={
                              <Switch onChange={onChange}
                                      name="is_take_away"
                                      checked={Boolean(order.is_take_away)} />
                            }/> */}
          <FormControlLabel label={t('Walk In')} labelPlacement="start" sx={{mb:2}}
                            control={
                              <Switch onChange={toogleWalkIn}
                                      checked={isWalkIn} />
                            }/>
          <Box sx={{mb:2}}>
          {order.hasOwnProperty('id') && <Button variant="contained" size="small" component="label">
            {t('Add document')}
            <input hidden name={props.name} onChange={e => {addDocument(e)}} type="file" />
          </Button>}
          {documents.map((doc,key) => {
            return <Box key={key} sx={{mt:2}}>
              <IconButton onClick={e => {removeDocument(doc.id)}} size="small">
                <DeleteIcon fontSize="small"/>
              </IconButton>
              <a href={doc.url} target="_blank">{doc.filename}</a>
            </Box>
          })}
          </Box>
        </div>
        <div className="col-md-8">
          <div className="row">
            <div className="col-md-6">
              <PhoneInput
                country={'dk'}
                value={order?.customer?.phone}
                disabled={isWalkIn}
                onChange={phone => setOrder(prev => ({
                  ...prev, customer: {
                    ...prev.customer,
                    phone: '+'+phone
                  }
                }))}
                containerClass="phone-input"
              />
            </div>
            <div className="col-md-6">
              <TextField label={t('First name')} size="small" fullWidth sx={{mb:2}}
                        type="text" id="customer_first_name" name="customer_first_name"
                        InputLabelProps={{ shrink: !!order?.customer?.first_name || isWalkIn }}
                        value={isWalkIn ? 'Walk in' : order?.customer?.first_name} disabled={isWalkIn}
                        onChange={onChange}/>
            </div>
            <div className="col-md-6">
              <TextField label={t('Last name')} size="small" fullWidth sx={{mb:2}}
                        type="text" id="customer_last_name" name="customer_last_name"
                        InputLabelProps={{ shrink: !!order?.customer?.last_name }}
                        value={order?.customer?.last_name} disabled={isWalkIn}
                        onChange={onChange}/>
            </div>
            <div className="col-md-6">
              <TextField label={t('Email address')} size="small" fullWidth sx={{mb:2}}
                        type="email" id="customer_email" name="customer_email"
                        InputLabelProps={{ shrink: !!order?.customer?.email }}
                        value={order?.customer?.email} disabled={isWalkIn}
                        onChange={onChange}/>
            </div>
            <div className="col-md-6">
              <TextField label={t('Zip code')} size="small" fullWidth sx={{mb:2}}
                        type="text" id="customer_zip_code" name="customer_zip_code"
                        InputLabelProps={{ shrink: !!order?.customer?.zip_code }}
                        value={order?.customer?.zip_code} disabled={isWalkIn}
                        onChange={onChange}/>
            </div>
            <div className="col-md-6">
              <FormControl size="small" fullWidth sx={{mb:2}}>
                <InputLabel id="label_language">{t('Language')}</InputLabel>
                <Select label={t('Language')} value={order?.customer?.language || ''}
                        labelId="label_language" id="customer_language" name="customer_language"
                        disabled={isWalkIn} onChange={onChange}>
                  {window.langs.map((lang,key) => {
                    return <MenuItem key={key} value={lang.lang}>{lang.title}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </div>
            <div className="col-md-6">
              <FormControlLabel label={t('Allow send emails')} labelPlacement="start" sx={{mb:2}}
                                control={
                                  <Switch onChange={onChange} disabled={isWalkIn}
                                          name="customer_allow_send_emails"
                                          checked={Boolean(order?.customer?.allow_send_emails)} />
                                }/>
            </div>
            <div className="col-md-6">
              <FormControlLabel label={t('Allow send news')} labelPlacement="start" sx={{mb:2}}
                                control={
                                  <Switch onChange={onChange} disabled={isWalkIn}
                                          name="customer_allow_send_news"
                                          checked={Boolean(order?.customer?.allow_send_news)} />
                                }/>
            </div>
          </div>
          <div className="row">
            <div className='GuestInfoBottom__container'>
              <div className='GuestInfoActiveTable'>
                <GuestTables
                  data={customers}
                  onSelectCustomer={!isWalkIn ? setTableOrder : () => {}}
                />
              </div>
            </div>
          </div>
        </div>
        {error && <p className='TabNewBooking__error'>{error}</p>}
        <Stack spacing={2} direction="row">
          <Button variant="contained" onClick={createOrder}>Save</Button>
          {order.hasOwnProperty('id') && <Button variant="outlined" onClick={deleteOrder}>Delete</Button>}
          <Button variant="outlined" onClick={() => props.handleClose()}>Cancel</Button>
        </Stack>
      </div>
  )
}
