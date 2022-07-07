import React, {useEffect, useState} from "react";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useTranslation } from 'react-i18next';


export default function AreasSelect() {
  const {t} = useTranslation();

  const [area, setArea] = useState([])

  useEffect(async () => {
    await getArea()
  }, [])

  const getArea = async () => {
    await axios.get(`${process.env.APP_URL}/api/places/${localStorage.getItem('place_id')}/areas`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setArea(response.data)
    }).catch(error => {
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'area') localStorage.setItem('place_id',e.target.value)
  };

  return (
    <div className='DayViewSelect__container'>
      <FormControl sx={{ m: 1, minWidth: 120 }} className='DayViewSelect'>
      <Select  value={localStorage.getItem('place_id')}
                     id="area" name="area" fullWidth
                      onChange={onChange}>
                {area.map((el,key) => {
                  return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
                })}
        </Select>
      </FormControl>
    </div>
  )
}
