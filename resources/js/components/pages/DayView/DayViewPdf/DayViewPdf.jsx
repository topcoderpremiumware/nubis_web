import React from 'react'
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  title: {
    margin: '10px 10px 30px 10px',
    textAlign: 'center'
  },
  thead: {
    flexDirection: 'row',
    margin: '0px 5px 0 5px',
    borderTop: '1px solid #ccc'
  },
  tbody: {
    flexDirection: 'row',
    margin: '0px 5px 0 5px',
  },
  th: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '100px',
    fontWeight: 'bold',
  },
  td: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '100px'
  },
});


const DayViewPdf = ({ title, columns, data }) => {
  columns = columns.filter(e => !['drag','self'].includes(e.field))
  return (
    <Document>
      <Page size="A4" orientation='landscape'>
        <View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.thead}>
          {columns.map((i, index) => (
            <Text style={(styles[i.field], styles['th'])} key={index}>{i.headerName}</Text>
          ))}
        </View>
        {data.map((datum, row_index) => (
          <View style={styles.tbody} key={row_index}>
            {columns.map((column, column_index) => (
              <Text key={column_index} style={(styles[column.field], styles['td'])}>{datum[column.field]}</Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  )
}

export default DayViewPdf
