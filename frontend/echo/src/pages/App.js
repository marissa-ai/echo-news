import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home'; // Component for the homepage
import Form from './Form'; // Component for submitting articles

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit-article" element={<Form />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

