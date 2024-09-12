import React, {useEffect, useState} from "react";
import  './Areas.scss';
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
import AreaEditPopup from "./AreaEditPopup"
import { useNavigate } from "react-router-dom";
import {StyledTableRow} from "../../components/StyledTableRow";

export default function Areas() {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [areas, setAreas] = useState([])
  const [editPopupOpened, setEditPopupOpened] = useState(false)
  const [selectedArea, setSelectedArea] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect( () => {
    getAreas()
    eventBus.on("placeChanged", () => {
      getAreas()
    })
  }, [])

  const getAreas = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/areas?all=1`).then(response => {
      setAreas(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  const updateArea = (area) => {
    let url = `${process.env.MIX_API_URL}/api/areas`
    if(area.hasOwnProperty('id')){
      url = `${process.env.MIX_API_URL}/api/areas/${area.id}`
    }

    axios.post(url, area,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      getAreas()
      setEditPopupOpened(false)
      eventBus.dispatch("notification", {type: 'success', message: 'Area saved successfully'});
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

  const openEditPopup = (area) => {
    if (!area) area = {
      place_id: localStorage.getItem('place_id'),
      name: '',
      length: 0,
      priority: 1,
      online_available: 1,
      labels: {}
    }
    setSelectedArea(area)
    setEditPopupOpened(true)
  }

  const deleteArea = (area) => {
    if (area.hasOwnProperty('id')) {
      if (window.confirm(t('Are you sure you want to delete this area?'))) {
        axios.delete(process.env.MIX_API_URL + '/api/areas/' + area.id, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          getAreas()
          eventBus.dispatch("notification", {type: 'success', message: 'Area deleted successfully'});
        }).catch(error => {
          eventBus.dispatch("notification", {type: 'error', message: error.message});
          console.log('Error', error)
        })
      }
    }
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Areas')}</h2>
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
                  <TableCell size="small">{t('Name')}</TableCell>
                  <TableCell size="small">{t('Priority')}</TableCell>
                  <TableCell size="small">{t('Online availability')}</TableCell>
                  <TableCell size="small" style={{minWidth: '100px'}}>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {areas.map((item, key) => {
                  return <StyledTableRow key={key}>
                    <TableCell size="small">{item.name}</TableCell>
                    <TableCell size="small">{item.priority}</TableCell>
                    <TableCell size="small">{item.online_available ? t('Yes') : t('No')}</TableCell>
                    <TableCell size="small">
                      <IconButton onClick={e => {
                        openEditPopup(item)
                      }} size="small">
                        <EditIcon fontSize="small"/>
                      </IconButton>
                      <IconButton onClick={e => {
                        deleteArea(item)
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
      <AreaEditPopup
        open={editPopupOpened}
        area={selectedArea}
        onChange={updateArea}
        onClose={e => {
          setEditPopupOpened(false)
        }}
      />
    </div>
  );
};
