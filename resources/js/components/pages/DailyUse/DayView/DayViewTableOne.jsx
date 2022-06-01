
// import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';



// const rows: GridRowsProp = [
//   { id: 1, col1: 'Hello', col2: 'World', col3: 'row1' },
//   { id: 2, col1: 'DataGridPro', col2: 'is Awesome', col3: 'row2' },
//   { id: 3, col1: 'MUI', col2: 'is Amazing', col3: 'row3' },
// ];


// const columns: GridColDef = [
//   { field: 'col1', headerName: 'Column 1', width: 150 },
//   { field: 'col2', headerName: 'Column 2', width: 150 },
//   { field: 'col3', headerName: 'Column 2', width: 150 },
//   { field: 'col4', headerName: 'Column 2', width: 150 },
//   { field: 'col5', headerName: 'Column 2', width: 150 },
//   { field: 'col6', headerName: 'Column 2', width: 150 },
//   { field: 'col6', headerName: 'Column 2', width: 150 },
//   { field: 'col6', headerName: 'Column 2', width: 150 },
//   { field: 'col6', headerName: 'Column 2', width: 150 },
//   { field: 'col6', headerName: 'Column 2', width: 150 },
//   { field: 'col6', headerName: 'Column 2', width: 150 },
// ];



// export default function DayViewTableOne() {
  
//   return (
//     <div className='DayView'>
//       <div style={{ height: 300, width: '100%' }}>
//         <DataGrid rows={rows} columns={columns} 
//         hideFooter
//         initialState={{
//           filter: {
//             filterModel: {
//               items: [{ columnField: 'rating', operatorValue: '>', value: '2.5' }],
//             },
//           },
//         }}
//       />
        
//       </div>
//     </div>
//   )
// }