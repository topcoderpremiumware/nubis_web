import React, {useEffect} from "react";
import  './GuestTables.scss';
import { useTranslation } from 'react-i18next';
import {DataGrid} from "@mui/x-data-grid";
import {IconButton, Tooltip} from "@mui/material";
import BlockIcon from '@mui/icons-material/Block';
import RestoreIcon from '@mui/icons-material/Restore';
import eventBus from "../../../../../../../../eventBus";

export default function GuestTables(props) {
  const {t} = useTranslation();

  useEffect( () => {

  }, [])

  const columns = [
    { field: 'first_name', headerName: t('First name'), flex: 1 },
    { field: 'last_name', headerName: t('Last name'), flex: 1 },
    { field: 'email', headerName: t('Email'), flex: 1 },
    { field: 'phone', headerName: t('Phone'), flex: 1 },
    { field: 'zip_code', headerName: t('Zip code'), flex: 1 },
    { field: 'self', headerName: t('Actions'), flex: 1, renderCell: (params) =>
        <IconButton onClick={e => {toggleBlock(params.value)}} size="small">{
          isBlocked(params.value) ?
            <Tooltip title={t('Remove from the blacklist')}><RestoreIcon fontSize="small"/></Tooltip> :
            <Tooltip title={t('Add to the blacklist')}><BlockIcon fontSize="small"/></Tooltip>
        }</IconButton>, },
  ];

  const isBlocked = (customer) => {
    if(customer.black_lists.length === 0) return false;
    let block = customer.black_lists.filter(item => parseInt(item.place_id) === parseInt(localStorage.getItem('place_id')))
    return block.length > 0
  }

  const toggleBlock = (customer) => {
    if(isBlocked(customer)){
      axios.delete(`${process.env.MIX_API_URL}/api/customers/${customer.id}/black_list?place_id=${localStorage.getItem('place_id')}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        eventBus.dispatch("notification", {type: 'success', message: 'Customer removed from the blacklist successfully'});
        eventBus.dispatch("customersChanged")
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }else{
      axios.post(`${process.env.MIX_API_URL}/api/customers/${customer.id}/black_list`, {
        'place_id': localStorage.getItem('place_id')
      },{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        eventBus.dispatch("notification", {type: 'success', message: 'Customer added to the blacklist successfully'});
        eventBus.dispatch("customersChanged")
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
  }

  const handleRowClick = (params) => {
    props.onSelectCustomer(params.row)
  };

  return (
    <div style={{ height: 320, width: '100%' }}>
      <DataGrid
        rowHeight={40}
        onRowClick={handleRowClick}
        rows={props.data}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
      />
    </div>
  );
};
