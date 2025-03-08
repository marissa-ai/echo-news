import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  const mockSetPage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo and navigation items', () => {
    render(<Navbar setPage={mockSetPage} />);
    
    expect(screen.getByText('Echo')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('calls setPage with correct values when navigation items are clicked', () => {
    render(<Navbar setPage={mockSetPage} />);
    
    fireEvent.click(screen.getByText('Home'));
    expect(mockSetPage).toHaveBeenCalledWith('home');

    fireEvent.click(screen.getByText('News'));
    expect(mockSetPage).toHaveBeenCalledWith('news');

    fireEvent.click(screen.getByText('Submit'));
    expect(mockSetPage).toHaveBeenCalledWith('submit');
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    render(<Navbar setPage={mockSetPage} />);
    
    // Initially, mobile menu should be hidden
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    
    // Click hamburger button
    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);
    
    // Menu should be visible
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    
    // Click again to hide
    fireEvent.click(menuButton);
    
    // Menu should be hidden again
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });

  it('closes mobile menu when a navigation item is clicked', () => {
    render(<Navbar setPage={mockSetPage} />);
    
    // Open mobile menu
    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);
    
    // Click a navigation item
    fireEvent.click(screen.getAllByText('Home')[0]);
    
    // Menu should be closed
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    expect(mockSetPage).toHaveBeenCalledWith('home');
  });

  it('navigates to home page when logo is clicked', () => {
    render(<Navbar setPage={mockSetPage} />);
    
    const logo = screen.getByText('Echo');
    fireEvent.click(logo);
    
    expect(mockSetPage).toHaveBeenCalledWith('home');
  });
}); 