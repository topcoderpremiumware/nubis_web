import React, {Component }from 'react';
import './../DataTables.css';
import './CustomDataTablesBooking.scss';

const $ = require('jquery');
$.DataTable = require('datatables.net');

class TablesBooking extends Component {
    componentDidMount(){
        // console.log(this.el)
        this.el = $(this.el)
        this.el.DataTable(
           {
            retrieve: true,
            // paging: false,
            scrollY: 400,
            scrollX: 400,
               data: this.props.data,
               columns: [
                   {title: "Flag"}, 
                   {title: "From"}, 
                   {title: "To"}, 
                   {title: "First Name"}, 
                   {title: "Last Name"}, 
                   {title: "Company"}, 
                   {title: "Pax"}, 
                   {title: "Drag"}, 
                   {title: "Booking Length"}, 
                   {title: "Visit"}, 
                   {title: "Restaurant"}, 
                   {title: "Guest Note"}, 
                   {title: "Guest History"}, 
                   {title: "Discount"}, 
                   {title: "Guest Status"}, 
                    
               ]
           } 
        )

    }
    componentWillUnmount(){
        // this.$el.DataTable.destroy(true);
    }

    render(){
      return(
        <div>
          <table class="display" width="100%" ref={el => this.el = el}>

          </table>
        </div>
      );
    }
  }

export default TablesBooking;