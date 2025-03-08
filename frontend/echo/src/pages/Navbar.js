import React, { useState } from 'react';

const Navbar = ({ setPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'news', label: 'News' },
    { id: 'submit', label: 'Submit' },
  ];

  return (
    <nav className="bg-white dark:bg-accent border-b sticky top-0 z-50">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setPage('home')}
              className="text-xl font-bold text-primary"
            >
              Echo
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className="button button-ghost px-4 py-2"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="button button-ghost p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setPage(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="button button-ghost w-full text-left px-4 py-2"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

