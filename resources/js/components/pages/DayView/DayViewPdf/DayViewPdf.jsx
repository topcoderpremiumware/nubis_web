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
  td1: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '100px'
  },
  td2: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '70px'
  },
  td3: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '70px'
  },
  td4: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '130px'
  },
  td5: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '130px'
  },
  td6: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '65px'
  },
  td7: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '90px'
  },
  td8: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '80px'
  },
  td9: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '100px'
  },
  td10: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '75px'
  },
  td11: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '120px'
  },
  td12: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '90px'
  },
  td13: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '140px'
  },
  td14: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    width: '100px'
  },
  td15: {
    fontSize: 10,
    padding: '5px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    borderRight: '1px solid #ccc',
    width: '150px'
  },
});

const DayViewPdf = ({ title, columns, data }) => {
  return (
    <Document>
      <Page size="A4" orientation='landscape'>
        <View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.thead}>
          {columns.map((i, index) => (
            <Text style={styles[`td${index + 1}`]} key={index}>{i}</Text>
          ))}
        </View>
        {data.map((i,index) => (
          <View style={styles.tbody} key={index}>
            <Text style={styles.td1}>{i.id}</Text>
            <Text style={styles.td2}>{i.from}</Text>
            <Text style={styles.td3}>{i.to}</Text>
            <Text style={styles.td4}>{i.first_name}</Text>
            <Text style={styles.td5}>{i.last_name}</Text>
            <Text style={styles.td6}>{i.seats}</Text>
            <Text style={styles.td7}>{i.take_away}</Text>
            <Text style={styles.td8}>{i.tables}</Text>
            <Text style={styles.td9}>{i.length}</Text>
            <Text style={styles.td10}>{i.source}</Text>
            <Text style={styles.td11}>{i.comment}</Text>
            <Text style={styles.td12}>{i.menu}</Text>
            <Text style={styles.td13}>{i.order_date}</Text>
            <Text style={styles.td14}>{i.status}</Text>
            <Text style={styles.td15}>{i.area}</Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}

export default DayViewPdf
