import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import Home from './Home';

const { mockGetProducts, mockAddToCart, mockUseAuth } = vi.hoisted(() => ({
  mockGetProducts: vi.fn(),
  mockAddToCart: vi.fn(),
  mockUseAuth: vi.fn(),
}));

vi.mock('../api/products', () => ({
  getProducts: mockGetProducts,
}));

vi.mock('../api/cart', () => ({
  addToCart: mockAddToCart,
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

const products = [
  {
    id: 1,
    name: 'Everyday Backpack',
    description: 'A practical everyday bag.',
    price: '39.99',
    stock: 25,
  },
];

function renderHome(isAuthenticated) {
  mockUseAuth.mockReturnValue({
    user: isAuthenticated ? { id: 1, email: 'test@example.com' } : null,
    isAuthenticated,
    logout: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CloudCart Add to cart', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetProducts.mockResolvedValue({
      products,
      count: products.length,
    });

    mockAddToCart.mockResolvedValue({
      message: 'Item added to cart.',
    });
  });

  it('adds a product for an authenticated user', async () => {
    const user = userEvent.setup();

    renderHome(true);

    await user.click(
      await screen.findByRole('button', { name: 'Add to cart' }),
    );

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(1, 1);
    });

    expect(
      await screen.findByText('Everyday Backpack added to your cart.'),
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'View cart' })).toHaveAttribute(
      'href',
      '/cart',
    );
  });

  it('opens navigation with home, products, cart, and logout actions', async () => {
    const user = userEvent.setup();

    renderHome(true);

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await user.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-label', 'Close navigation menu');
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute(
      'href',
      '#products',
    );
    expect(screen.getByRole('link', { name: 'Cart' })).toHaveAttribute(
      'href',
      '/cart',
    );
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('shows login and sign up actions when logged out', async () => {
    const user = userEvent.setup();

    renderHome(false);
    await user.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    );

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
      'href',
      '/register',
    );
    expect(screen.queryByRole('link', { name: 'Cart' })).not.toBeInTheDocument();
  });

  it('redirects an unauthenticated user to login', async () => {
    const user = userEvent.setup();

    renderHome(false);

    await user.click(
      await screen.findByRole('button', { name: 'Add to cart' }),
    );

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it('displays an API error when adding a product fails', async () => {
    const user = userEvent.setup();

    mockAddToCart.mockRejectedValue({
      response: {
        data: {
          error: 'Insufficient stock.',
        },
      },
    });

    renderHome(true);

    await user.click(
      await screen.findByRole('button', { name: 'Add to cart' }),
    );

    expect(await screen.findByText('Insufficient stock.')).toBeInTheDocument();
  });
});
