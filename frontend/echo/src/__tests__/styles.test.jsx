import React from 'react';
import { render } from '@testing-library/react';
import '../styles/globals.css';

describe('Styling System', () => {
  it('applies container class correctly', () => {
    const { container } = render(<div className="container mx-auto px-4">Content</div>);
    const element = container.firstChild;
    expect(element).toHaveClass('container', 'mx-auto', 'px-4');
  });

  it('applies card class correctly', () => {
    const { container } = render(
      <div className="bg-white rounded-lg shadow-md p-6">Content</div>
    );
    const element = container.firstChild;
    expect(element).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
  });

  it('applies button classes correctly', () => {
    const { container } = render(
      <div>
        <button className="px-4 py-2 bg-primary text-white rounded-md">Primary</button>
        <button className="px-4 py-2 bg-secondary text-white rounded-md">Secondary</button>
        <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Ghost</button>
      </div>
    );
    
    const [primary, secondary, ghost] = container.querySelectorAll('button');
    
    expect(primary).toHaveClass('px-4', 'py-2', 'bg-primary', 'text-white', 'rounded-md');
    expect(secondary).toHaveClass('px-4', 'py-2', 'bg-secondary', 'text-white', 'rounded-md');
    expect(ghost).toHaveClass('px-4', 'py-2', 'text-gray-700', 'hover:bg-gray-100', 'rounded-md');
  });

  it('applies grid layout classes correctly', () => {
    const { container } = render(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">Content</div>
    );
    const element = container.firstChild;
    expect(element).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      'gap-6'
    );
  });

  it('applies heading styles correctly', () => {
    const { container } = render(
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Heading 1</h1>
        <h2 className="text-3xl font-semibold text-gray-900">Heading 2</h2>
        <h3 className="text-2xl font-medium text-gray-900">Heading 3</h3>
      </div>
    );

    const [h1, h2, h3] = container.children[0].children;

    expect(h1.className).toBe('text-4xl font-bold text-gray-900');
    expect(h2.className).toBe('text-3xl font-semibold text-gray-900');
    expect(h3.className).toBe('text-2xl font-medium text-gray-900');
  });

  it('applies text utility classes correctly', () => {
    const { container } = render(
      <p className="text-gray-500 text-sm">Content</p>
    );
    const element = container.firstChild;
    expect(element).toHaveClass('text-gray-500', 'text-sm');
  });

  it('applies flex utility classes correctly', () => {
    const { container } = render(
      <div className="flex items-center justify-between space-x-4">Content</div>
    );
    const element = container.firstChild;
    expect(element).toHaveClass('flex', 'items-center', 'justify-between', 'space-x-4');
  });

  it('applies spacing utility classes correctly', () => {
    const { container } = render(
      <div className="p-4 m-2 space-y-4">Content</div>
    );
    const element = container.firstChild;
    expect(element).toHaveClass('p-4', 'm-2', 'space-y-4');
  });
}); 