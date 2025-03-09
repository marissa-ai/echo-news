import React from 'react';
import { render } from '@testing-library/react';

describe('Styling System', () => {
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

  it('applies container styles correctly', () => {
    const { container } = render(
      <div className="container mx-auto px-4">Content</div>
    );

    expect(container.firstChild.className).toBe('container mx-auto px-4');
  });

  it('applies card styles correctly', () => {
    const { container } = render(
      <div className="bg-white rounded-lg shadow-md p-6">Card Content</div>
    );

    expect(container.firstChild.className).toBe('bg-white rounded-lg shadow-md p-6');
  });

  it('applies button styles correctly', () => {
    const { container } = render(
      <div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Primary
        </button>
        <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Secondary
        </button>
        <button className="bg-transparent hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded">
          Ghost
        </button>
      </div>
    );

    const [primary, secondary, ghost] = container.firstChild.children;
    expect(primary.className).toBe('bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded');
    expect(secondary.className).toBe('bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded');
    expect(ghost.className).toBe('bg-transparent hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded');
  });

  it('applies grid layout classes correctly', () => {
    const { container } = render(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    );

    expect(container.firstChild.className).toBe('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
  });

  it('applies text utility classes correctly', () => {
    const { container } = render(
      <div>
        <p className="text-gray-500 text-sm">Muted text</p>
        <p className="text-gray-900 text-lg font-semibold">Bold text</p>
      </div>
    );

    const [muted, bold] = container.firstChild.children;
    expect(muted.className).toBe('text-gray-500 text-sm');
    expect(bold.className).toBe('text-gray-900 text-lg font-semibold');
  });

  it('applies flex utility classes correctly', () => {
    const { container } = render(
      <div className="flex items-center justify-between space-x-4">
        <div>Item 1</div>
        <div>Item 2</div>
      </div>
    );

    expect(container.firstChild.className).toBe('flex items-center justify-between space-x-4');
  });

  it('applies spacing utility classes correctly', () => {
    const { container } = render(
      <div>
        <div className="p-4">Padding</div>
        <div className="m-2">Margin</div>
        <div className="space-y-4">Space Between</div>
      </div>
    );

    const [padding, margin, spaceBetween] = container.firstChild.children;
    expect(padding.className).toBe('p-4');
    expect(margin.className).toBe('m-2');
    expect(spaceBetween.className).toBe('space-y-4');
  });
}); 