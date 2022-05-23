import React from 'react';
import ReactDOM from 'react-dom';

import Topbar from "./sections/topbar/topbar";
import Sidebar from "./sections/sidebar/Sidebar";
import DailyUse from "./pages/DailyUse/DailyUse";
import DailyUseInfo from "./pages/DailyUse/DailyUseInfo/DailyUseInfo";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
    return (
        <BrowserRouter>
        <Topbar/>
        <div className="container">
            <Sidebar/>
            <Routes>
            <Route path='/' exact element={<DailyUse/>} />
            <Route path='/DailyUse' element={<DailyUse/>} />
            <Route path='/home' element={<DailyUseInfo/>} />
            </Routes>
        </div>
        </BrowserRouter>
    );
}

export default App;

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
