import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import Form from './Form';
import ArticleList from './ArticleList';
import AdminPortal from './AdminPortal'; // Assuming this is the admin portal component

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<ArticleList />} />
        <Route path="/submit" element={<Form />} />
        <Route path="/admin" element={<AdminPortal />} />
      </Routes>
    </Router>
  );
};

export default App;

