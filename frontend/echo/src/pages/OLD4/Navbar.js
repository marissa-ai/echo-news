import React from 'react';
import Link from 'next/link';
import './Navbar.css'; // Ensure this file exists and contains your styles

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/submit">Submit Article</Link>
        </li>
        <li>
          <Link href="/admin">Admin Portal</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

