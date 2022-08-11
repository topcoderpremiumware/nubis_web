
import React, { Component } from "react";
// import './../DataTables.css';
// import './../CustomTables.scss';
import GuestTablesApi from "./GuestTablesApi";

class GuestTable extends Component {
  render() {
    return (
      <div className="Tables">
        <GuestTablesApi data={this.dataSet}>

        </GuestTablesApi>
      </div>
    );
  }
  dataSet = [
    [
      "Tiger",
      "Nixon",
      "Apple",
      "San Francisco",
      "80568457897",
      "apple@gmail.com",
      "",
      "",
    ],
    [
      "Tiger",
      "Nixon",
      "Apple",
      "San Francisco",
      "80568457897",
      "apple@gmail.com",
      "",
      "",
    ],
    [
      "Tiger",
      "Nixon",
      "Apple",
      "San Francisco",
      "80568457897",
      "apple@gmail.com",
      "",
      "",
    ],
    [
      "Tiger",
      "Nixon",
      "Apple",
      "San Francisco",
      "80568457897",
      "apple@gmail.com",
      "",
      "",
    ],
    [
      "Tiger",
      "Nixon",
      "Apple",
      "San Francisco",
      "80568457897",
      "apple@gmail.com",
      "",
      "",
    ],
    
  ];
}

export default GuestTable;
