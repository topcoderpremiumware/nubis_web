
import React, {Component }from 'react';
// import './../DataTables.css';
// import './CustomDataTablesBooking.scss';

const $ = require('jquery');
$.DataTable = require('datatables.net');

class Tables extends Component {
    componentDidMount(){
        // console.log(this.el)
        this.el = $(this.el)
        this.el.DataTable(
           {
            retrieve: true,
            paging: false,
            scrollY: 120,
            scrollX: 120,
            autoWidth: true,
               data: this.props.data,
               columns: [
                {title: "First Name"}, 
                {title: "Last Name"}, 
                {title: "Company"}, 
                {title: "Address"}, 
                {title: "Phone"}, 
                {title: "Email"}, 
                {title: "Room no."}, 
                {title: "Member no."}, 
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

export default Tables;