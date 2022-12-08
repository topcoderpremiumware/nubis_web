import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './../i18nextConf';
import "./App.css";

import LoadingPage from "../components/LoadingPage";

function App() {
  if(localStorage.getItem('token')){
    axios.get(`${process.env.APP_URL}/api/user`).then(response => {
    }).catch(error => {
      if (error.response.status === 401){
        localStorage.clear()
        window.location.href="/"
      }
    })
  }
  return (
    <Suspense fallback={<LoadingPage/>}>
      <div className="content">
        {localStorage.getItem('token') ?
          <>
            hello, feedback for order {window.location.pathname.split('/')[2]}
          </>
          :
          <div>

          </div>
        }
      </div>
    </Suspense>
  );
}

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<App />, document.getElementById('app'));
}
