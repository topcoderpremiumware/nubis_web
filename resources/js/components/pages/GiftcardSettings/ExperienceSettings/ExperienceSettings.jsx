import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import eventBus from "../../../../eventBus";
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
import { useNavigate } from "react-router-dom";
import ExperienceEditPopup from "./ExperienceEditPopup";
import {StyledTableRow} from "../../../components/StyledTableRow";

export default function ExperienceSettings() {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [menus, setMenus] = useState([])
  const [editPopupOpened, setEditPopupOpened] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMenus()
    function placeChanged(){
      getMenus()
    }
    eventBus.on("placeChanged", placeChanged)

    return () => {
      eventBus.remove("placeChanged", placeChanged)
    }
  }, [])

  const getMenus = async () => {
    setLoading(true)
    await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/giftcard_menus`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setMenus(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  const updateMenu = async (menu) => {
    let url = `${process.env.MIX_API_URL}/api/giftcard_menus`
    if (menu.hasOwnProperty('id')) {
      url = `${process.env.MIX_API_URL}/api/giftcard_menus/${menu.id}`
    }

    return await axios.post(url, generateFormData(menu), {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      getMenus()
      setEditPopupOpened(false)
      eventBus.dispatch("notification", {type: 'success', message: 'Experience saved successfully'});
      return true
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
      return false
    })
  }

  const generateFormData = (data) => {
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if(key === 'labels'){
        for (const [lang_key, lang_value] of Object.entries(value)) {
          for (const [data_key, data_value] of Object.entries(lang_value)) {
            formData.append(key+'['+lang_key+']['+data_key+']', data_value)
          }
        }
      }else{
        formData.append(key, value)
      }
    }
    return formData
  }

  const openEditPopup = (menu) => {
    if (!menu) menu = {
      place_id: localStorage.getItem('place_id'),
      name: '',
      active: 1,
      labels: {},
      price: 0
    }
    setSelectedMenu(menu)
    setEditPopupOpened(true)
  }

  const deleteMenu = (menu) => {
    if (menu.hasOwnProperty('id')) {
      if (window.confirm(t('Are you sure you want to delete this experience?'))) {
        axios.delete(`${process.env.MIX_API_URL}/api/giftcard_menus/${menu.id}`, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          getMenus()
          eventBus.dispatch("notification", {type: 'success', message: 'Experience deleted successfully'});
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
        <h2>{t('Experience Settings')}</h2>
      </Stack>
      <div className="container-fluid">
        <div className="row">
          {loading ? <div><CircularProgress/></div> : <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small">{t('Name')}</TableCell>
                  <TableCell size="small">{t('Active')}</TableCell>
                  <TableCell size="small" style={{minWidth: '100px'}}>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menus.map((item, key) => {
                  return <StyledTableRow key={key}>
                    <TableCell size="small">{item.name}</TableCell>
                    <TableCell size="small">{item.active ? t('Yes') : t('No')}</TableCell>
                    <TableCell size="small">
                      <IconButton onClick={e => {
                        openEditPopup(item)
                      }} size="small">
                        <EditIcon fontSize="small"/>
                      </IconButton>
                      <IconButton onClick={e => {
                        deleteMenu(item)
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
      <ExperienceEditPopup
        open={editPopupOpened}
        menu={selectedMenu}
        onChange={updateMenu}
        onClose={e => {
          setEditPopupOpened(false)
        }}
      />
    </div>
  );
};
