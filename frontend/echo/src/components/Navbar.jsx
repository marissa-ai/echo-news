import React from 'react';

const Navbar = ({ setPage }) => {
  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div>
            <span className="text-xl font-bold">Echo</span>
          </div>
          <div className="flex space-x-6">
            <button 
              className="hover:text-gray-600" 
              onClick={() => setPage('home')}
            >
              Home
            </button>
            <button 
              className="hover:text-gray-600" 
              onClick={() => setPage('news')}
            >
              News
            </button>
            <button 
              className="hover:text-gray-600" 
              onClick={() => setPage('submit')}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;