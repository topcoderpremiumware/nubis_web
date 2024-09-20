import React, {useEffect, useState} from "react";
import  './Roles.scss';
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
import RoleEditPopup from "./RoleEditPopup"
import { useNavigate } from "react-router-dom";
import {StyledTableRow} from "../../components/StyledTableRow";

export default function Roles() {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [users, setUsers] = useState([])
  const [editPopupOpened, setEditPopupOpened] = useState(false)
  const [selectedUser, setSelectedUser] = useState({})
  const [loading, setLoading] = useState(true)


  useEffect( () => {
    getUsers()
    eventBus.on("placeChanged", () => {
      getUsers()
    })
  }, [])

  const getUsers = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/users`,{
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }).then(response => {
      setUsers(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  const updateUser = (email,role) => {
    axios.post(`${process.env.MIX_API_URL}/api/user/role`, {
      email: email,
      role_id: role,
      place_id: localStorage.getItem('place_id')
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      getUsers()
      setEditPopupOpened(false)
      eventBus.dispatch("notification", {type: 'success', message: 'Role saved successfully'});
    }).catch(error => {
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          eventBus.dispatch("notification", {type: 'error', message: value});
        }
      } else if (error.response.status === 401) {
        eventBus.dispatch("notification", {type: 'error', message: 'Authorization error'});
      } else {
        eventBus.dispatch("notification", {type: 'error', message: error.response.data.message});
        console.error('Error', error.message,error.response.data.message)
      }
    })
  }

  const openEditPopup = (user) => {
    setSelectedUser({
      email: user ? user.email : '',
      role: user ? user.roles[0].id : '',
      pin: user ? user.pin : ''
    })
    setEditPopupOpened(true)
  }

  const deleteRole = (user) => {
    if (user.hasOwnProperty('email')) {
      if (window.confirm(t('Are you sure you want to delete this role?'))) {
        axios.delete(process.env.MIX_API_URL + '/api/user/role', {
          params: {
            email: user.email,
            place_id: localStorage.getItem('place_id')
          },
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          getUsers()
          eventBus.dispatch("notification", {type: 'success', message: 'Role deleted successfully'});
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
        <h2>{t('Roles')}</h2>
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
                  <TableCell size="small">{t('Role')}</TableCell>
                  <TableCell size="small">{t('Name')}</TableCell>
                  <TableCell size="small">{t('Email')}</TableCell>
                  <TableCell size="small" style={{minWidth: '100px'}}>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.filter(item => {return !item.is_superadmin}).map((item, key) => {
                  return <StyledTableRow key={key}>
                    <TableCell size="small">{item.roles[0].title}</TableCell>
                    <TableCell size="small">{item.name}</TableCell>
                    <TableCell size="small">{item.email}</TableCell>
                    <TableCell size="small">
                      <IconButton onClick={e => {openEditPopup(item)}} size="small">
                        <EditIcon fontSize="small"/>
                      </IconButton>
                      <IconButton onClick={e => {deleteRole(item)}} size="small">
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
      <RoleEditPopup
        open={editPopupOpened}
        user={selectedUser}
        onChange={updateUser}
        onClose={e => {
          setEditPopupOpened(false)
        }}
      />
    </div>
  );
};
