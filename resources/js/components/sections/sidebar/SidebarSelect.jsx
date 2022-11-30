import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import { Autocomplete, TextField } from "@mui/material";

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
      setPlaces(response.data.map(i => ({label: i.name, id: i.id})))
    }).catch(error => {
    })
  }

  return (
    <div className='SidebarSelect__container'>
      <Autocomplete
        disablePortal
        id="places"
        options={places}
        size="small"
        onChange={(event, newValue) => {
          setPlace(newValue)
          localStorage.setItem('place_id', newValue.id)
          eventBus.dispatch("placeChanged")
        }}
        renderInput={(params) => 
          <TextField 
            {...params} 
            displayEmpty 
            placeholder="Places" 
          />
        }
      />
    </div>
  );
}

