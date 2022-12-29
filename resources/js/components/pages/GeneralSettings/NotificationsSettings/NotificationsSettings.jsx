import { Button, TextField } from '@mui/material'
import React, {useEffect} from 'react'
import { useState } from 'react'
import eventBus from "../../../../eventBus";

const NotificationsSettings = () => {
  const [number, setNumber] = useState(null)

  useEffect(() => {

    eventBus.on("placeChanged", () => {

    })
  },[])

  const onSave = async (ev) => {
    ev.preventDefault()
    console.log('number', number)
  }

  return (
    <div className='pages__container'>
      <h2>Admin confirmation number</h2>
      <form onSubmit={onSave}>
        <div className="mt-3 mb-3">
          <TextField label={'Admin SMS number'} size="small" fullWidth
            type="text" id="number" name="number"
            onChange={ev => setNumber(ev.target.value)} />
        </div>
        <Button variant="contained" type="submit">Save</Button>
      </form>
    </div>
  )
}

export default NotificationsSettings
