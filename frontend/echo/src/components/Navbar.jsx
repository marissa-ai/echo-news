import React, { useState } from 'react';

const Navbar = ({ setPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    setPage('home');
  };

  const handleNavClick = (page) => {
    setPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div>
            <button 
              className="text-xl font-bold"
              onClick={handleLogoClick}
            >
              Echo
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <button 
              className="hover:text-gray-600" 
              onClick={() => handleNavClick('home')}
            >
              Home
            </button>
            <button 
              className="hover:text-gray-600" 
              onClick={() => handleNavClick('news')}
            >
              News
            </button>
            <button 
              className="hover:text-gray-600" 
              onClick={() => handleNavClick('submit')}
            >
              Submit
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden" data-testid="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                className="block w-full text-left px-3 py-2 hover:bg-gray-50" 
                onClick={() => handleNavClick('home')}
              >
                Home
              </button>
              <button 
                className="block w-full text-left px-3 py-2 hover:bg-gray-50" 
                onClick={() => handleNavClick('news')}
              >
                News
              </button>
              <button 
                className="block w-full text-left px-3 py-2 hover:bg-gray-50" 
                onClick={() => handleNavClick('submit')}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;