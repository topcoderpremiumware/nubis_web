import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

import './DayViewTableOne.scss';


const columns = [
  { field: 'id', headerName: 'ID', type: 'number', headerClassName:'tableСolumn',},
  { field: 'form', headerName: 'Form',},
  { field: 'to', headerName: 'To', },
  { field: 'firstName', headerName: 'First name',  },
  { field: 'lastName', headerName: 'Last name', },
  { field: 'company', headerName: 'Company',  },
  { field: 'pax', headerName: 'Pax',  },
  { field: 'table', headerName: 'Table',  },
  { field: 'drag', headerName: 'Drag', },
  { field: 'bookinglength', headerName: 'Booking length',},
  { field: 'visits', headerName: 'Visits', },
  { field: 'restaurantNote', headerName: 'Restaurant note', },
  { field: 'guestNote', headerName: 'Guest note', },
  { field: 'guestHistory', headerName: 'Guest history', },
  { field: 'guestStatus', headerName: 'Guest status', },
  { field: 'discount', headerName: 'Discount', },
  { field: 'payment', headerName: 'Payment', },
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
  { id: 1, form:'18:30',to: '19:30', lastName: 'Snow', firstName: 'Jon', company: 'Company', pax:1, table: 9, drag:'', bookinglength: 450, visits: 1, restaurantNote: '', guestNote:'', guestHistory:'', guestStatus:'', discount:'', payment:'', },
  { id: 2, form:'18:30',to: '19:30', lastName: 'Snow', firstName: 'Jon', company: 'Company', pax:1, table: 9, drag:'', bookinglength: 450, visits: 1, restaurantNote: '', guestNote:'', guestHistory:'', guestStatus:'', discount:'', payment:'', },
  { id: 3, form:'18:30',to: '19:30', lastName: 'Snow', firstName: 'Jon', company: 'Company', pax:1, table: 9, drag:'', bookinglength: 450, visits: 1, restaurantNote: '', guestNote:'', guestHistory:'', guestStatus:'', discount:'', payment:'', },
  { id: 4, form:'18:30',to: '19:30', lastName: 'Snow', firstName: 'Jon', company: 'Company', pax:1, table: 9, drag:'', bookinglength: 450, visits: 1, restaurantNote: '', guestNote:'', guestHistory:'', guestStatus:'', discount:'', payment:'', },
  { id: 5, form:'18:30',to: '19:30', lastName: 'Snow', firstName: 'Jon', company: 'Company', pax:1, table: 9, drag:'', bookinglength: 450, visits: 1, restaurantNote: '', guestNote:'', guestHistory:'', guestStatus:'', discount:'', payment:'', },
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

        sx={{
          width: 1,
          '& .tableСolumn': {
            width:'max-content',
          },
        }}
      />
    </div>
  );
}
