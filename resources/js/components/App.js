import React from 'react';
import ReactDOM from 'react-dom';
import Topbar from "./sections/topbar/topbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./sections/sidebarnew/Sidebarnew";
import {DailyUse, DayView, WeekView, Activity } from './pages/DailyUse/DailyUse';

function App() {
    return (
        <BrowserRouter>
        <Topbar/>
        <div className="content">
            <Sidebar/>
            <Routes>
                <Route path='/dailyuse' exact element={<DailyUse/>} />
                <Route path='/DayView' exact element={<DayView/>} />
                <Route path='/WeekView' exact element={<WeekView/>} />
                <Route path='/Activity' exact element={<Activity/>} />
          </Routes>
        </div>
        </BrowserRouter>
    );
}

export default App;

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
