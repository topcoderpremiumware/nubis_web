import React, {useEffect, useState} from "react";
import  './ManageFeedback.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import {
  Button, CircularProgress,
  IconButton, Rating, Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ViewIcon from "@mui/icons-material/Visibility";
import FeedbackViewPopup from "./FeedbackViewPopup"
import Moment from "moment";
import {DataGrid} from "@mui/x-data-grid";

export default function ManageFeedback() {
  const {t} = useTranslation();

  const [feedbacks, setFeedbacks] = useState([])
  const [viewPopupOpened, setViewPopupOpened] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect( () => {
    getFeedbacks()
    eventBus.on("placeChanged", () => {
      getFeedbacks()
    })
  }, [])

  const columns = [
    { field: 'public', headerName: t('Public'), flex: 1 },
    { field: 'comment_short', headerName: t('Comment'), flex: 1 },
    { field: 'average_mark', headerName: t('Average rating'), flex: 1, renderCell: (params) =>
        <span style={{display: 'flex', alignItems: 'center'}}><Rating value={params.value} precision={0.5} readOnly/>({params.value.toLocaleString("en",{minimumFractionDigits: 1})})</span>, },
    { field: 'customer_name', headerName: t('Customer'), flex: 1 },
    { field: 'booking_date', headerName: t('Booking date'), flex: 1 },
    { field: 'self', headerName: t('Actions'), flex: 1, renderCell: (params) =>
        <IconButton onClick={e => {openViewPopup(params.value)}} size="small"><ViewIcon fontSize="small"/></IconButton>, },
  ];

  const getFeedbacks = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/feedbacks`,{
      params: {
        place_id: localStorage.getItem('place_id')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      let feeds = response.data.map(item => {
        item.public = item.status === 'public' ? t('Yes') : t('No')
        item.customer_name = item.customer.first_name+' '+item.customer.last_name
        item.booking_date = Moment.utc(item.order.reservation_time).format('YYYY-MM-DD HH:mm')
        item.comment_short = item.comment.substring(0,20) + (item.comment.length > 20 ? '...' : '')
        item.self = item
        return item
      })
      setFeedbacks(feeds)
      setLoading(false)
    }).catch(error => {
    })
  }

  const openViewPopup = (feedback) => {
    setSelectedFeedback(feedback)
    setViewPopupOpened(true)
  }

  return (
    <div className='pages__container'>
      <h2>{t('Manage Feedback')}</h2>
      <div className="container-fluid">
        <div className="row">
          {loading ? <div><CircularProgress/></div> : <div style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
            <DataGrid
              rows={feedbacks}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
            />
          </div>}
        </div>
      </div>
      <FeedbackViewPopup
        open={viewPopupOpened}
        feedback={selectedFeedback}
        onClose={e => {
          getFeedbacks()
          setViewPopupOpened(false)
        }}
      />
    </div>
  );
};
