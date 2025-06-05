import React, {useEffect, useState} from "react";
import  './CustomBookingLength.scss';
import { useTranslation } from 'react-i18next';
import 'moment/locale/da'
import {
  FormControl,
  FormControlLabel, FormGroup,
  Grid, IconButton, InputLabel,
  MenuItem, Select, Stack, Switch, TextField, Tooltip,
} from "@mui/material";
import 'react-datepicker/dist/react-datepicker.css';
import ListSubheader from "@mui/material/ListSubheader";
import './../GuestPayment/PaymentSettings/PaymentSettings.scss'
import axios from "axios";
import eventBus from "../../../eventBus";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Moment from "moment/moment";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
export default function Courses(props) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(async () => {
    getProducts()
  }, [])

  useEffect(async () => {
    setCourses(props.courses)
  }, [props.courses])

  const getProducts = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/products?search=`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setProducts(response.data)
    }).catch(error => {
    })
  }

  const onChange = (event,cIndex,pIndex = null) => {
    let c = courses
    if(event.target.name === 'name') c[cIndex].name = event.target.value
    if(event.target.name === 'product'){
      let o = products.find(e => e.id === event.target.value);
      c[cIndex].products[pIndex] = o && { id: o.id, name: o.name };
    }
    props.onChange({target: {name: 'courses', value: c}});
  }

  const addCourse = () => {
    let c = courses ?? []
    c.push({
      name: '',
      products: []
    })
    props.onChange({target: {name: 'courses', value: c}});
  }

  const deleteCourse = (cIndex) => {
    let c = courses ?? []
    c.splice(cIndex, 1)
    props.onChange({target: {name: 'courses', value: c}});
  }

  const addProduct = (cIndex) => {
    let c = courses ?? [];
    c[cIndex].products.push({})
    props.onChange({target: {name: 'courses', value: c}});
  }

  const deleteProduct = (cIndex,pIndex) => {
    let c = courses ?? [];
    c[cIndex].products.splice(pIndex, 1)
    props.onChange({target: {name: 'courses', value: c}});
  }

  return (<>
    <ListSubheader component="div" disableSticky sx={{mb:2}}>{t('Courses')}</ListSubheader>
    {courses && courses.map((course,cIndex) => <div key={cIndex}>
      <Stack spacing={2} mb={2} direction="row" alignItems="center">
        <TextField label={t('Name')} size="small" fullWidth
                   type="text" id="name" name="name" required
                   onChange={e => onChange(e,cIndex)} value={course.name}
        />
        <IconButton onClick={e => deleteCourse(cIndex)} size="small"><DeleteIcon fontSize="small"/></IconButton>
      </Stack>
      <Box pl={3}>
        {course.products.map((product, pIndex) => <div key={pIndex}>
          <Stack spacing={2} mb={2} direction="row" alignItems="center">
            <FormControl size="small" fullWidth>
              <InputLabel id="label_product">{t('Product')}</InputLabel>
              <Select label={t('Product')} value={product.id ?? ''}
                      labelId="label_product" size="small" name="product"
                      onChange={e => onChange(e,cIndex,pIndex)}
              >
                {products.map((p,key) => {
                  return <MenuItem key={key} value={p.id}>{p.name}</MenuItem>
                })}
              </Select>
            </FormControl>
            <IconButton onClick={e => deleteProduct(cIndex,pIndex)} size="small"><DeleteIcon fontSize="small"/></IconButton>
          </Stack>
        </div>)}
        <Stack spacing={2} mb={2} direction="row" alignItems="center">
          <IconButton onClick={e => addProduct(cIndex)} size="small">
            <Tooltip title={t('Add product')}><AddCircleIcon fontSize="small"/></Tooltip>
          </IconButton>
        </Stack>
      </Box>
    </div>)}
    <Stack spacing={2} mb={2} direction="row" alignItems="center">
      <IconButton onClick={addCourse} size="small">
        <Tooltip title={t('Add course')}><AddCircleIcon fontSize="small"/></Tooltip>
      </IconButton>
    </Stack>
  </>);
};
