import React, {Component }from 'react';
import './DataTablesBooking.css';

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
               data: this.props.data,
               columns: [
                   {title: "Name"}, 
                   {title: "Position"}, 
                   {title: "Office"}, 
                   {title: "Extn."}, 
                   {title: "Start date"}, 
                   {title: "Salary"}, 
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