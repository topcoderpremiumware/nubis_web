import {
  Button,
  CircularProgress,
  FormControl, IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  styled, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow,
} from '@mui/material';
import React, {useEffect, useState} from 'react'
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoGuideEditPopup from "./VideoGuideEditPopup";
import {StyledTableRow} from "../../components/StyledTableRow";

const VideoGuideSettings = () => {
  const { t } = useTranslation();

  const [language, setLanguage] = useState(localStorage.getItem('i18nextLng'))
  const [guides, setGuides] = useState([])
  const [editPopupOpened, setEditPopupOpened] = useState(false)
  const [selectedGuide, setSelectedGuide] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
      getGuides()
  },[language])

  const getGuides = () => {
    setLoading(true)
    axios.get(process.env.MIX_API_URL+'/api/video_guides',{
      params: {
        language: language
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setGuides(response.data)
      setLoading(false)
    }).catch(error => {})
  }

  const onSubmit = (item) => {
    axios.post(process.env.MIX_API_URL+'/api/video_guides',{
        ...item,
        language: language
      },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      getGuides()
      setEditPopupOpened(false)
      eventBus.dispatch("notification", {type: 'success', message: 'Guide saved successfully'});
    }).catch(error => {})
  }

  const openEditPopup = (item) => {
    if (!item) item = {title: '',description:'',youtube_id:'',page_url:''}
    setSelectedGuide(item)
    setEditPopupOpened(true)
  }

  const onDelete = (e,index,item) => {
    if(item.hasOwnProperty('id')){
      axios.delete(process.env.MIX_API_URL + '/api/video_guides/' + item.id, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        let temp = guides
        temp.splice(index, 1)
        setGuides([...temp])
        eventBus.dispatch("notification", {type: 'success', message: 'Guide deleted successfully'});
      }).catch(error => {})
    }else{
      let temp = guides
      temp.splice(index, 1)
      setGuides([...temp])
    }
  }

  const shortDescription = (text,length) => {
    if(text && text.length > length){
      text = text.substring(0, length)+'...'
    }
    return text
  }

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Video Guide Settings')}</h2>
      </Stack>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 col-md-6 mt-3">
            <div className="mb-3">
              <FormControl size="small" fullWidth>
                <InputLabel id="label_language">{t('Language')}</InputLabel>
                <Select label={t('Language')} value={language}
                        labelId="label_language" id="language" name="language"
                        onChange={(e) => setLanguage(e.target.value)}>
                  {window.langs.map((lang,key) => {
                    return <MenuItem key={key} value={lang.lang}>{lang.title}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
        <div className="row">
          {loading ? <div><CircularProgress/></div> : <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small">{t('Title')}</TableCell>
                  <TableCell size="small">{t('Description')}</TableCell>
                  <TableCell size="small">{t('YouTube id')}</TableCell>
                  <TableCell size="small">{t('Page url')}</TableCell>
                  <TableCell size="small" style={{minWidth: '100px'}}>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {guides.map((item, index) => {
                  return <StyledTableRow key={index}>
                    <TableCell size="small">{item.title}</TableCell>
                    <TableCell size="small">{shortDescription(item.description,100)}</TableCell>
                    <TableCell size="small">{item.youtube_id}</TableCell>
                    <TableCell size="small">{item.page_url}</TableCell>
                    <TableCell size="small">
                      <IconButton onClick={e => {
                        openEditPopup(item)
                      }} size="small">
                        <EditIcon fontSize="small"/>
                      </IconButton>
                      <IconButton onClick={e => {
                        onDelete(e,index,item)
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
      <VideoGuideEditPopup
        open={editPopupOpened}
        guide={selectedGuide}
        onChange={onSubmit}
        onClose={e => {
          setEditPopupOpened(false)
        }}
      />
    </div>
  )
}

export default VideoGuideSettings
