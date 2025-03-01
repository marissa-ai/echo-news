import React from 'react';
import './Navbar.css'; // CSS file for styling

const Navbar = ({ setPage }) => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <a href="#" onClick={() => setPage('home')}>
            Home
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setPage('news')}>
            News
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setPage('submit')}>
            Submit Article
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

