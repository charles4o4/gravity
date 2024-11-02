import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Stage1 from './components/Stage1';
import './App.css'

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Stage1 />} />
            </Routes>
        </Router>
    );
};

export default App;