import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import NewBookingPopUpContent from './NewBookingPopUpContent';
import './NewBooking.scss';

import CloseIcon from '@mui/icons-material/Close';
import {useEffect} from "react";
import eventBus from "../../../../../eventBus";
import Moment from "moment";


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  height: '87%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function NewBookingPopUp({selectedOrder, setSelectedOrder}) {
  const [open, setOpen] = React.useState(false);
  const [order, setOrder] = React.useState({});
  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null)
  }

  useEffect(async () => {
    if(selectedOrder && Object.keys(selectedOrder).length) {
      setOrder(selectedOrder)
      setOpen(true)
      return
    }

    eventBus.on("newBookingOpen",  (data) => {
      if(data && data.hasOwnProperty('id') && data.id > 0){
        axios.get(`${process.env.MIX_API_URL}/api/orders/${data.id}`, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          setOrder(response.data)
        }).catch(error => {
        })
      }else{
        setOrder({
          area_id: localStorage.getItem('area_id'),
          comment: "",
          customer: {},
          customer_id: null,
          is_take_away: 0,
          length: 120,
          marks: "",
          place_id: localStorage.getItem('place_id'),
          reservation_time: Moment().utc().format('YYYY-MM-DD HH:mm'),
          seats: 1,
          source: "internal",
          status: "ordered",
          table_ids: [],
          tableplan_id: 0,
        })
      }
      setOpen(true);
    });
  }, [selectedOrder])

  return (
    <div>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className='NewBookingPopUp__container'>
          <div className='close-icon' onClick={handleClose}><CloseIcon/></div>
          <NewBookingPopUpContent order={order}/>
        </Box>
      </Modal>
    </div>
  );
}
