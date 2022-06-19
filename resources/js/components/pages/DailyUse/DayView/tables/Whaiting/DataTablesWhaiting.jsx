import React, { Component } from "react";
import './../DataTables.css';
import './../CustomTables.scss';
import TablesWhaiting from "./DataTablesWhaitingApi.jsx";

class DayViewTableWhaiting extends Component {
  render() {
    return (
      <div className="Tables">
        <TablesWhaiting data={this.dataSet}>

        </TablesWhaiting>
      </div>
    );
  }
  dataSet = [
    [
      "Tiger Nixon",
      "System Architect",
      "Edinburgh",
      "5421",
      "2011/04/25",
      "$320,800",
      "$320,800",
      "$320,800",
      "$320,800",
      "$320,800",
      "$320,800",
      "$320,800",
      "$320,800",
      "$320,800",
      "$320,800",
    ],
    [
      "Garrett Winters",
      "Accountant",
      "Tokyo",
      "8422",
      "2011/07/25",
      "$170,750",
      "$170,750",
      "$170,750",
      "$170,750",
      "$170,750",
      "$170,750",
      "$170,750",
      "$170,750",
      "$170,750",
      "$170,750",
    ],
    [
      "Ashton Cox",
      "Junior Technical Author",
      "San Francisco",
      "1562",
      "2009/01/12",
      "$86,000",
      "$86,000",
      "$86,000",
      "$86,000",
      "$86,000",
      "$86,000",
      "$86,000",
      "$86,000",
      "$86,000",
      "$86,000",
    ],
    
  ];
}

export default DayViewTableWhaiting;
