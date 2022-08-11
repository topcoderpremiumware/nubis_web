import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import eventBus from "../../../eventBus";

export default function SidebarSelect() {
  const {t} = useTranslation();

  const [places, setPlaces] = useState([])
  const [place, setPlace] = useState('')

  useEffect(async () => {
    await getPlaces()
    setPlace(localStorage.getItem('place_id'))
  }, [])

  const getPlaces = async () => {
    await axios.get(`${process.env.APP_URL}/api/places/mine`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setPlaces(response.data)
    }).catch(error => {
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'place'){
      setPlace(e.target.value)
      localStorage.setItem('place_id',e.target.value)
      eventBus.dispatch("placeChanged")
    }
  };

  return (
    <div className='SidebarSelect__container'>
      <FormControl sx={{ minWidth: 120 }} className='SidebarSelect' fullWidth>
          <Select  value={place} size="small"
                     id="place" name="place" fullWidth
                      onChange={onChange}>
                {places.map((el,key) => {
                  return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
                })}
        </Select>
      </FormControl>
    </div>
  );
}

