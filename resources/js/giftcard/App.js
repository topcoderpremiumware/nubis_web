import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './../i18nextConf';
import "./App.css";
import LoadingPage from "../components/LoadingPage";



function App() {
  return (
    <Suspense fallback={<LoadingPage/>}>
      <div className="content">
        hello, giftcard
      </div>
    </Suspense>
  );
}

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<App />, document.getElementById('app'));
}
