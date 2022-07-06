import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function SidebarSelect() {
  const {t} = useTranslation();

  const [listrest, setListRest] = useState([])

  useEffect(async () => {
    await getListRest()
  }, [])

  const getListRest = async () => {
    await axios.get(`${process.env.APP_URL}/api/places/mine`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setListRest(response.data)
    }).catch(error => {
    })
  }

  const onChange = (e) => {
    if(e.target.name === 'listrest') localStorage.setItem('place_id',e.target.value)
  };

  return (
    <div className='SidebarSelect__container'>
      <FormControl sx={{ minWidth: 120 }} className='SidebarSelect' fullWidth>
          <Select  value={localStorage.getItem('place_id')} size="small"
                     id="listrest" name="listrest" fullWidth
                      onChange={onChange}>
                {listrest.map((el,key) => {
                  return <MenuItem key={key} value={el.id}>{el.name}</MenuItem>
                })}
        </Select>
      </FormControl>
    </div>
  );
}

