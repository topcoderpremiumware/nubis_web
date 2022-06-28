import React, {Component }from 'react';
import './CustomDataTablesDeleted.scss';

const $ = require('jquery');
$.DataTable = require('datatables.net');

class TablesDeleted extends Component {
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
                   {title: "Phone number"},
                   {title: "Email"},
                   {title: "Deleted date"},
                   {title: "Initials"},
                   {title: "Area"},
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
          <table className="display" width="100%" ref={el => this.el = el}>

          </table>
        </div>
      );
    }
  }

export default TablesDeleted;
