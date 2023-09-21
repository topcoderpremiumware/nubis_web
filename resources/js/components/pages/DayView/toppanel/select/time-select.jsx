import React, {useEffect} from 'react'

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Moment from "moment";
import eventBus from "../../../../../eventBus";


export default function TimeSelect() {

  const [times, setTimes] = React.useState([]);
  const [time, setTime] = React.useState('0');

  useEffect(async () => {
    await getTime()
    if(localStorage.getItem('time'))
      setTime(localStorage.getItem('time'))

    eventBus.on("placeChanged", () => {
      setTimes([])
      setTime('0')
      localStorage.removeItem('time')
    });
    eventBus.on("areaChanged", async () => {
      await getTime()
      setTime('0')
      localStorage.removeItem('time')
    });
    eventBus.on("dateChanged", async () => {
      await getTime()
      setTime('0')
      localStorage.removeItem('time')
    });
  }, [])

  const getTime = async () => {
    if(localStorage.getItem('area_id')){
      await axios.get(`${process.env.MIX_API_URL}/api/areas/${localStorage.getItem('area_id')}/working`, {
        params: {
          date: localStorage.getItem('date') || Moment.utc().format('YYYY-MM-DD')
        },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        setTimes(response.data)
      }).catch(error => {
      })
    }
  }

  const onChange = (e) => {
    if(e.target.name === 'time'){
      setTime(e.target.value)
      localStorage.setItem('time',e.target.value)
      eventBus.dispatch("timeChanged")
    }
  };

  return (
    <div className='DayViewSelect__container'>
      <FormControl sx={{ minWidth: 120 }} className='DayViewSelect'>
        <Select value={time}
                id="time" name="time" fullWidth
                onChange={onChange}>
          <MenuItem value="0"><em>All day</em></MenuItem>
          {times.map((el,key) => {
            return <MenuItem key={key} value={JSON.stringify(el)}>
              {Moment.utc(el.from,'HH:mm:ss').format('HH:mm')}
              {' - '}
              {Moment.utc(el.to,'HH:mm:ss').format('HH:mm')}
            </MenuItem>
          })}
        </Select>
      </FormControl>
    </div>
  )
}
