import React, {useEffect, useState} from "react";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../../../eventBus";


export default function AreasSelect() {
  const {t} = useTranslation();

  const [areas, setAreas] = useState([])
  const [area, setArea] = useState('')

  useEffect(() => {
    getArea().then(() => {
      if(localStorage.getItem('area_id'))
        setArea(localStorage.getItem('area_id'))
    })
    function placeChanged(){
      getArea().then(() => {
        setArea('')
        localStorage.removeItem('area_id')
      })
    }
    eventBus.on("placeChanged",  placeChanged);

    return () => {
      eventBus.remove("placeChanged",  placeChanged);
    }
  }, [])

  const getArea = async () => {
    if(localStorage.getItem('place_id')){
      await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/areas?all=1`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        setAreas([{id: 'all', name: 'All areas'}, ...response.data])
      }).catch(error => {
      })
    }
  }

  const onChange = (e) => {
    if(e.target.name === 'area'){
      setArea(e.target.value)
      localStorage.setItem('area_id',e.target.value)
      console.log('dispatch','areaChanged')
      eventBus.dispatch("areaChanged")
    }
  };

  return (
    <div className='DayViewSelect__container'>
      <FormControl sx={{ m: 1, minWidth: 120 }} className='DayViewSelect'>
        <Select value={area}
                id="area" name="area" fullWidth
                onChange={onChange}>
          {areas.map((el,key) => {
            return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
          })}
        </Select>
      </FormControl>
    </div>
  )
}
