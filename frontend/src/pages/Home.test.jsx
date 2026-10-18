import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Home from './Home';
import { getProducts } from '../api/products';

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock('../api/products', () => ({
  getProducts: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

const sampleProducts = [
  {
    id: 1,
    name: 'Everyday Backpack',
    description: 'A practical everyday bag.',
    price: '39.99',
    stock: 25,
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    description: 'A comfortable wireless mouse.',
    price: '19.50',
    stock: 40,
  },
  {
    id: 3,
    name: 'Steel Water Bottle',
    description: 'A reusable steel bottle.',
    price: '14.99',
    stock: 0,
  },
];

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe('CloudCart Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });

    getProducts.mockResolvedValue({
      products: sampleProducts,
      count: sampleProducts.length,
    });
  });

  it('displays the product catalogue returned by the API', async () => {
    renderHome();

    expect(
      await screen.findByRole('heading', {
        name: 'Everyday Backpack',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Wireless Mouse' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Steel Water Bottle' }),
    ).toBeInTheDocument();

    expect(screen.getByText('$39.99')).toBeInTheDocument();
    expect(screen.getByText('$19.50')).toBeInTheDocument();
    expect(screen.getByText('$14.99')).toBeInTheDocument();

    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  it('displays the loading state while products are being fetched', () => {
    getProducts.mockReturnValue(new Promise(() => {}));

    renderHome();

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('displays an error when the product API fails', async () => {
    getProducts.mockRejectedValue(new Error('Network failure'));

    renderHome();

    expect(
      await screen.findByText(
        'Unable to load products. Please check whether the backend is running.',
      ),
    ).toBeInTheDocument();
  });

  it('displays an empty state when the API returns no products', async () => {
    getProducts.mockResolvedValue({
      products: [],
      count: 0,
    });

    renderHome();

    expect(
      await screen.findByText(
        'No products found. Seed the database and try again.',
      ),
    ).toBeInTheDocument();
  });

  it('disables Add to cart for an out-of-stock product', async () => {
    renderHome();

    const button = await screen.findByRole('button', {
      name: 'Out of stock',
    });

    expect(button).toBeDisabled();
  });
});
