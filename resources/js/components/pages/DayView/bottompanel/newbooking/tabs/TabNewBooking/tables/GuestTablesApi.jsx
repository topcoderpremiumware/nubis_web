import React, {Component }from 'react';
import './GuestTables.scss'

const $ = require('jquery');
$.DataTable = require('datatables.net');

class Tables extends Component {
  componentDidMount() {
    this.el = $(this.el)
    this.el.DataTable({
      retrieve: true,
      paging: false,
      scrollY: 180,
      autoWidth: true
    })
  }

  render() {
    return(
      <div className="guest-table">
        <table width="100%" ref={el => this.el = el}>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Zip Code</th>
            </tr>
          </thead>
          <tbody>
            {this.props.data.map(i => (
              <tr
                key={i.id}
                onClick={() => this.props.onClick(i)}
              >
                <td>{i.first_name || '-'}</td>
                <td>{i.last_name || '-'}</td>
                <td>{i.email || '-'}</td>
                <td>{i.phone || '-'}</td>
                <td>{i.zip_code || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Tables;