import React from 'react';
import Link from 'next/link';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link href="/">Home</Link>
      <Link href="/submit-article">Submit Article</Link>
      <Link href="/admin-portal">Admin Portal</Link>
    </nav>
  );
};

export default Navbar;

