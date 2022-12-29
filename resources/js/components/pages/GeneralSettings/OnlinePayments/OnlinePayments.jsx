import { Button, FormControlLabel, FormGroup, Switch, TextField } from '@mui/material'
import React, {useEffect} from 'react'
import { useState } from 'react'
import eventBus from "../../../../eventBus";

const OnlinePayments = () => {
  const [prepayment, setPrepayment] = useState(false)
  const [amount, setAmount] = useState(0)

  useEffect(() => {

    eventBus.on("placeChanged", () => {

    })
  },[])

  const onSave = async (ev) => {
    ev.preventDefault()
    console.log('prepayment', prepayment)
    console.log('amount', amount)
  }

  return (
    <div className='pages__container'>
      <h2>Online Payments</h2>
      <form onSubmit={onSave}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={prepayment}
                onChange={(ev, checked) => setPrepayment(checked)}
              />
            }
            label="Online payment"
          />
        </FormGroup>
        <div className="mt-3 mb-3">
          <TextField label={'Amount'} size="small" fullWidth
            type="text" id="amount" name="amount"
            onChange={ev => setAmount(ev.target.value)} />
        </div>
        <Button variant="contained" type="submit">Save</Button>
      </form>
    </div>
  )
}

export default OnlinePayments
