import React, {useEffect, useState} from "react";
import  './OpeningTimes.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import {
  Button, CircularProgress,
  IconButton, Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TimetableEditPopup from "./TimetableEditPopup"
import Moment from "moment";
import { useNavigate } from "react-router-dom";

export default function OpeningTimes() {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [timetables, setTimetables] = useState([])
  const [areas, setAreas] = useState([])
  const [tableplans, setTableplans] = useState([])
  const [editPopupOpened, setEditPopupOpened] = useState(false)
  const [selectedTimetable, setSelectedTimetable] = useState({})
  const [loading, setLoading] = useState(true)

  const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  useEffect(async () => {
    await getAreas()
    await getTableplans()
    await getTimetables()
    eventBus.on("placeChanged", async () => {
      await getAreas()
      await getTableplans()
      await getTimetables()
    })
  }, [])

  const getTimetables = async () => {
    setLoading(true)
    await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/timetables`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setTimetables(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  const getAreas = async () => {
    await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/areas?all=1`).then(response => {
      setAreas(response.data)
    }).catch(error => {
    })
  }

  const getTableplans = async () => {
    await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/tableplans`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setTableplans(response.data)
    }).catch(error => {
    })
  }

  const updateTimetable = (timetable) => {
    console.log('timetable',timetable)
    let url = `${process.env.MIX_API_URL}/api/timetables`
    if(timetable.hasOwnProperty('id')){
      url = `${process.env.MIX_API_URL}/api/timetables/${timetable.id}`
    }

    axios.post(url, timetable,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      getTimetables()
      setEditPopupOpened(false)
      eventBus.dispatch("notification", {type: 'success', message: 'Timetable saved successfully'});
    }).catch(error => {
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          eventBus.dispatch("notification", {type: 'error', message: value});
        }
      } else if (error.response.status === 401) {
        eventBus.dispatch("notification", {type: 'error', message: 'Authorization error'});
      } else {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error.message)
      }
    })
  }

  const openEditPopup = (time) => {
    if (!time){
      time = {
        place_id: localStorage.getItem('place_id'),
        start_date: Moment.utc().format('YYYY-MM-DD'),
        end_date: Moment.utc().format('YYYY-MM-DD'),
        start_time: '',
        end_time: '',
        week_days: [],
        area_id: null,
        tableplan_id: null,
        length: 0,
        max: 999,
        min: 0,
        status: 'working',
        booking_limits: []
      }
    }
    if(!time.booking_limits){
      time['booking_limits'] = []
    }
    if (time.booking_limits.length === 0){
      for (let i=0;i<24*4;i++){
        time['booking_limits'].push({
          max_books:0,
          max_seats:0
        })
      }
    }

    setSelectedTimetable(time)
    setEditPopupOpened(true)
  }

  const deleteTimetable = (time) => {
    if (time.hasOwnProperty('id')) {
      if (window.confirm(t('Are you sure you want to delete this timetable?'))) {
        axios.delete(process.env.MIX_API_URL + '/api/timetables/' + time.id, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          getTimetables()
          eventBus.dispatch("notification", {type: 'success', message: 'Timetable deleted successfully'});
        }).catch(error => {
          eventBus.dispatch("notification", {type: 'error', message: error.message});
          console.log('Error', error)
        })
      }
    }
  }

  const getAreaName = (area_id) => {
    const area = areas.find(el => el.id === area_id)
    if (area) {
      return area.name
    } else {
      return ''
    }
  }

  const getTableplanName = (tableplan_id) => {
    const tableplan = tableplans.find(el => el.id === tableplan_id)
    if (tableplan) {
      return tableplan.name
    } else {
      return ''
    }
  }

  const dateFromFormat = (date) => {
    if(date.startsWith('0004')){
      return date.replace('0004',Moment.utc().format('YYYY'))
    }else{
      return date
    }
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Opening Times')}</h2>
        <Button 
          variant="contained" 
          size="sm"
          type="button"
          onClick={() => navigate('/VideoGuides')}
        >{t('See Nubis Academy')}</Button>
      </Stack>
      <div className="container-fluid">
        <div className="row">
          {loading ? <div><CircularProgress/></div> : <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small">{t('Area')}</TableCell>
                  <TableCell size="small">{t('Tableplan')}</TableCell>
                  <TableCell size="small">{t('Status')}</TableCell>
                  <TableCell size="small" style={{minWidth: '110px'}}>{t('Start date')}</TableCell>
                  <TableCell size="small" style={{minWidth: '110px'}}>{t('End date')}</TableCell>
                  <TableCell size="small" style={{minWidth: '100px'}}>{t('From time')}</TableCell>
                  <TableCell size="small" style={{minWidth: '100px'}}>{t('To time')}</TableCell>
                  <TableCell size="small" style={{minWidth: '110px'}}>{t('Week days')}</TableCell>
                  <TableCell size="small">{t('Length')}</TableCell>
                  <TableCell size="small" style={{minWidth: '100px'}}>{t('Max seats')}</TableCell>
                  <TableCell size="small" style={{minWidth: '100px'}}>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timetables.map((time, key) => {
                  return <StyledTableRow key={key}>
                    <TableCell size="small">{getAreaName(time.area_id)}</TableCell>
                    <TableCell size="small">{getTableplanName(time.tableplan_id)}</TableCell>
                    <TableCell size="small">{time.status}</TableCell>
                    <TableCell size="small">{dateFromFormat(time.start_date)}</TableCell>
                    <TableCell size="small">{dateFromFormat(time.end_date)}</TableCell>
                    <TableCell size="small">{Moment.utc(time.start_time,'HH:mm:ss').local().format('HH:mm:ss')}</TableCell>
                    <TableCell size="small">{Moment.utc(time.end_time,'HH:mm:ss').local().format('HH:mm:ss')}</TableCell>
                    <TableCell size="small">{time.week_days.join()}</TableCell>
                    <TableCell size="small">{time.length}</TableCell>
                    <TableCell size="small">{time.max}</TableCell>
                    <TableCell size="small">
                      <IconButton onClick={e => {
                        openEditPopup(time)
                      }} size="small">
                        <EditIcon fontSize="small"/>
                      </IconButton>
                      <IconButton onClick={e => {
                        deleteTimetable(time)
                      }} size="small">
                        <DeleteIcon fontSize="small"/>
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                })}
              </TableBody>
            </Table>
          </TableContainer>}
        </div>
      </div>
      <Stack spacing={2} sx={{mt: 2}} direction="row">
        <Button variant="contained" type="button" onClick={e => {
          openEditPopup(false)
        }}>{t('New')}</Button>
      </Stack>
      <TimetableEditPopup
        open={editPopupOpened}
        timetable={selectedTimetable}
        areas={areas}
        tableplans={tableplans}
        onChange={updateTimetable}
        onClose={e => {
          setEditPopupOpened(false)
        }}
      />
    </div>
  );
};
