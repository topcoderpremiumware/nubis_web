import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('18:30', '19:30', 'First Name','Last Name', 'Donna', '3', '9', '', '450' ),
];

export default function DayViewTableTwo() {
  return (
    <TableContainer component={Paper} className='table-row'>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead >
          <TableRow>
            <TableCell>Form</TableCell>
            <TableCell align="right">To</TableCell>
            <TableCell align="right">First Name</TableCell>
            <TableCell align="right">Last Name</TableCell>
            <TableCell align="right">Company</TableCell>
            <TableCell align="right">Pax</TableCell>
            <TableCell align="right">Table</TableCell>
            <TableCell align="right">Drag</TableCell>
            <TableCell align="right">Booking length</TableCell>
            <TableCell align="right">Visits</TableCell>
            <TableCell align="right">Restaurant note</TableCell>
            <TableCell align="right">Guest note</TableCell>
            <TableCell align="right">Guest history</TableCell>
            <TableCell align="right">Guest status</TableCell>
            <TableCell align="right">Discount</TableCell>
            <TableCell align="right">Payment</TableCell> 
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
              <TableCell align="right">{row.protein}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
