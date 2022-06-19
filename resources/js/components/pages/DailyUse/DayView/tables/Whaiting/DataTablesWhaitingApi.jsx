import React, {Component }from 'react';
import './CustomDataTablesWhaiting.scss';

const $ = require('jquery');
$.DataTable = require('datatables.net');

class TablesWhaiting extends Component {
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
                   {title: "From"}, 
                   {title: "To"}, 
                   {title: "Pax"}, 
                   {title: "First name"}, 
                   {title: "Last name"}, 
                   {title: "Company"}, 
                   {title: "Contact person"}, 
                   {title: "Restaurant note"}, 
                   {title: "Guest status"}, 
                   {title: "Order date"}, 
                   {title: "Initials"}, 
                   {title: "Guest note"}, 
                   {title: "Booking ID"},                 
                    
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

export default TablesWhaiting;