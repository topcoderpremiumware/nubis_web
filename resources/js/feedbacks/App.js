import React, {Suspense, useState, useLayoutEffect, useEffect} from 'react';
import ReactDOM from 'react-dom';
import './../i18nextConf';
import "./App.css";

import LoadingPage from "../components/LoadingPage";
import axios from 'axios';

function App() {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let place_id = window.location.pathname.split('/')[2]
    console.log('place_id',place_id)
  }, [])

  return (
    <Suspense fallback={<LoadingPage/>}>

    </Suspense>
  );
}

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<App />, document.getElementById('app'));
}
