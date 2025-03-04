import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import eventBus from "../../../../eventBus";
import {
  Button, CircularProgress,
  IconButton, Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TerminalEditPopup from "./TerminalEditPopup"
import { useNavigate } from "react-router-dom";
import {StyledTableRow} from "../../../components/StyledTableRow";
import {simpleCatchError} from "../../../../helper";
import {localBankTerminal} from "../../../../localBankTerminal";
import SecurityUpdateIcon from '@mui/icons-material/SecurityUpdate';

export default function Terminals() {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [terminals, setTerminals] = useState([])
  const [editPopupOpened, setEditPopupOpened] = useState(false)
  const [selectedTerminal, setSelectedTerminal] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect( () => {
    getTerminals()
    eventBus.on("placeChanged", () => {
      getTerminals()
    })
  }, [])

  const getTerminals = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/terminals`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setTerminals(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  const updateTerminal = (terminal) => {
    let url = `${process.env.MIX_API_URL}/api/terminals`
    if(terminal.hasOwnProperty('id')){
      url = `${process.env.MIX_API_URL}/api/terminals/${terminal.id}`
    }

    axios.post(url, terminal,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      getTerminals()
      setEditPopupOpened(false)
      eventBus.dispatch("notification", {type: 'success', message: 'Terminal saved successfully'});
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const openEditPopup = (terminal) => {
    if (!terminal) terminal = {
      place_id: localStorage.getItem('place_id'),
      serial: '',
      url: ''
    }
    setSelectedTerminal(terminal)
    setEditPopupOpened(true)
  }

  const pullTerminalTransaction = (terminal) => {
    if (terminal.hasOwnProperty('id')) {
      if(window.ipcRenderer || window.ReactNativeWebView){
        localBankTerminal('transaction', null, terminal, window.user_id)
      }
    }
  }

  const deleteTerminal = (terminal) => {
    if (terminal.hasOwnProperty('id')) {
      if (window.confirm(t('Are you sure you want to delete this terminal?'))) {
        axios.delete(`${process.env.MIX_API_URL}/api/terminals/${terminal.id}`, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          getTerminals()
          eventBus.dispatch("notification", {type: 'success', message: 'Terminal deleted successfully'});
        }).catch(error => {
          eventBus.dispatch("notification", {type: 'error', message: error.message});
          console.log('Error', error)
        })
      }
    }
  }

  return (
    <div className='pages__container'>
      <Stack spacing={2} mb={2} direction="row" alignItems="center">
        <h2>{t('Terminals')}</h2>
      </Stack>
      <div className="container-fluid">
        <div className="row">
          {loading ? <div><CircularProgress/></div> : <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small">{t('POIID')}</TableCell>
                  <TableCell size="small">{t('Url')}</TableCell>
                  <TableCell size="small" style={{minWidth: '100px'}}>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {terminals.map((item, key) => {
                  return <StyledTableRow key={key}>
                    <TableCell size="small">{item.serial}</TableCell>
                    <TableCell size="small">{item.url}</TableCell>
                    <TableCell size="small">
                      <IconButton onClick={e => {
                        openEditPopup(item)
                      }} size="small">
                        <EditIcon fontSize="small"/>
                      </IconButton>
                      <IconButton onClick={e => {
                         pullTerminalTransaction(item)
                      }} size="small">
                        <SecurityUpdateIcon fontSize="small"/>
                      </IconButton>
                      <IconButton onClick={e => {
                        deleteTerminal(item)
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
      <TerminalEditPopup
        open={editPopupOpened}
        terminal={selectedTerminal}
        onChange={updateTerminal}
        onClose={e => {
          setEditPopupOpened(false)
        }}
      />
    </div>
  );
};
