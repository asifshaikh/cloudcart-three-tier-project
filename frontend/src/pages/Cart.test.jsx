import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Cart from './Cart';

const { mockGetCart, mockUpdateCartItem, mockRemoveCartItem, mockUseAuth } =
  vi.hoisted(() => ({
    mockGetCart: vi.fn(),
    mockUpdateCartItem: vi.fn(),
    mockRemoveCartItem: vi.fn(),
    mockUseAuth: vi.fn(),
  }));

vi.mock('../api/cart', () => ({
  getCart: mockGetCart,
  updateCartItem: mockUpdateCartItem,
  removeCartItem: mockRemoveCartItem,
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

const sampleCart = {
  items: [
    {
      id: 10,
      product: {
        id: 1,
        name: 'Everyday Backpack',
        price: '39.99',
      },
      quantity: 2,
      line_total: '79.98',
    },
    {
      id: 11,
      product: {
        id: 2,
        name: 'Wireless Mouse',
        price: '19.50',
      },
      quantity: 1,
      line_total: '19.50',
    },
  ],
  total: '99.48',
};

function renderCart() {
  return render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>,
  );
}

describe('CloudCart Cart page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      token: 'test-access-token',
    });

    mockGetCart.mockResolvedValue(sampleCart);
    mockUpdateCartItem.mockResolvedValue({});
    mockRemoveCartItem.mockResolvedValue({});
  });

  it('displays cart items, quantities, and total', async () => {
    renderCart();

    expect(
      await screen.findByRole('heading', {
        name: 'Everyday Backpack',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Wireless Mouse' }),
    ).toBeInTheDocument();

    expect(screen.getByText('$79.98')).toBeInTheDocument();
    expect(screen.getByText('$19.50')).toBeInTheDocument();
    expect(screen.getByText('$99.48')).toBeInTheDocument();

    expect(
      screen.getByText('3', { selector: '.summary-row span' }),
    ).toBeInTheDocument();
  });

  it('displays an empty-cart message when there are no items', async () => {
    mockGetCart.mockResolvedValue({
      items: [],
      total: '0.00',
    });

    renderCart();

    expect(
      await screen.findByRole('heading', { name: 'Your cart is empty' }),
    ).toBeInTheDocument();
  });

  it('increases the quantity and reloads the cart', async () => {
    const user = userEvent.setup();

    renderCart();

    const increaseButton = await screen.findByRole('button', {
      name: 'Increase quantity of Everyday Backpack',
    });

    await user.click(increaseButton);

    await waitFor(() => {
      expect(mockUpdateCartItem).toHaveBeenCalledWith(10, 3);
    });

    expect(mockGetCart).toHaveBeenCalledTimes(2);
  });

  it('removes an item and reloads the cart', async () => {
    const user = userEvent.setup();

    renderCart();

    const removeButtons = await screen.findAllByRole('button', {
      name: 'Remove',
    });

    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(mockRemoveCartItem).toHaveBeenCalledWith(10);
    });

    expect(mockGetCart).toHaveBeenCalledTimes(2);
  });

  it('displays an error when loading the cart fails', async () => {
    mockGetCart.mockRejectedValue({
      response: {
        data: {
          error: 'Unable to load cart.',
        },
      },
    });

    renderCart();

    expect(await screen.findByText('Unable to load cart.')).toBeInTheDocument();
  });

  it('displays an error when updating a quantity fails', async () => {
    const user = userEvent.setup();

    mockUpdateCartItem.mockRejectedValue({
      response: {
        data: {
          error: 'Quantity exceeds available stock.',
        },
      },
    });

    renderCart();

    await user.click(
      await screen.findByRole('button', {
        name: 'Increase quantity of Everyday Backpack',
      }),
    );

    expect(
      await screen.findByText('Quantity exceeds available stock.'),
    ).toBeInTheDocument();
  });
});
