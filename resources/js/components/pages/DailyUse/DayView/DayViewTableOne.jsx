import React from 'react';
import { DataGrid } from '@mui/x-data-grid';


const columns = [
  { field: 'id', headerName: 'ID', width:30, type: 'number'},
  { field: 'form', headerName: 'Form', width:100},
  { field: 'to', headerName: 'To', width:100},
  { field: 'firstName', headerName: 'First name', width: 100, },
  { field: 'lastName', headerName: 'Last name', width: 130, },
  { field: 'company', headerName: 'Company', width: 90, },
  { field: 'pax', headerName: 'Pax', width: 90, },
  { field: 'table', headerName: 'Table', width: 90, },
  { field: 'drag', headerName: 'Drag', width: 90, },
  { field: 'bookinglength', headerName: 'Booking length', width: 90, },
  { field: 'bookinglength', headerName: 'Booking length', width: 90, },
  { field: 'bookinglength', headerName: 'Booking length', width: 90, },
  // {
  //   field: 'fullName',
  //   headerName: 'Full name',
  //   description: 'This column has a value getter and is not sortable.',
  //   sortable: false,
  //   width: 160,
  //   valueGetter: (params) =>
  //     `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  // },

];

const rows = [
  { id: 1, form:'18:30',to: '19:30', lastName: 'Snow', firstName: 'Jon', company: 'Company' },
];

export default function DayViewTableOne() {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
    </div>
  );
}
