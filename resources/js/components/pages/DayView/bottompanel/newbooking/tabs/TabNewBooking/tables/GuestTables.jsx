import React, {useEffect} from "react";
import  './GuestTables.scss';
import { useTranslation } from 'react-i18next';
import {DataGrid} from "@mui/x-data-grid";

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
  ];

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
