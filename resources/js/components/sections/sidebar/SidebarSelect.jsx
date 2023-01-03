import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import { Autocomplete, Button, TextField } from "@mui/material";
import { Link } from "react-router-dom";

export default function SidebarSelect() {
  const {t} = useTranslation();

  const [places, setPlaces] = useState([])
  const [place, setPlace] = useState('')

  useEffect(async () => {
    await getPlaces()
    setPlace(localStorage.getItem('place_id'))
  }, [])

  const getPlaces = async () => {
    await axios.get(`${process.env.MIX_API_URL}/api/places/mine`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setPlaces(response.data.map(i => ({label: i.name+' ('+i.id+')', id: i.id})))
    }).catch(error => {
    })
  }

  const currentPlaceLabel = () => {
    let pl = places.find((el) => el.id == place)
    if(pl){
      return pl.label
    }else{
      return null
    }
  }

  return (
    <div className='SidebarSelect__container'>
      <Autocomplete
        disablePortal
        disableClearable
        id="places"
        options={[{ label: 'Create new', id: 'new' }, ...places]}
        renderOption={(props, option) => (
          option.id === 'new'
            ? (
              <Link {...props} to="/RestaurantNew" className="SidebarSelect__link">
                <Button variant="contained" fullWidth>
                  {option.label}
                </Button>
              </Link>
            ) : (
              <li {...props}>{option.label}</li>
            )
        )}
        size="small"
        onChange={(event, newValue) => {
          if (newValue.id === 'new') return
          setPlace(newValue.id)
          localStorage.setItem('place_id', newValue.id)
          eventBus.dispatch("placeChanged")
        }}
        renderInput={(params) =>
          <TextField
            {...params}
            placeholder="Places"
          />
        }
        value={currentPlaceLabel()}
      />
    </div>
  );
}

