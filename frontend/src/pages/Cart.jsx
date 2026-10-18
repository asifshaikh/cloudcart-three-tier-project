import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getCart, updateCartItem, removeCartItem } from '../api/cart';

import { useAuth } from '../context/AuthContext';

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

export default function Cart() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState(null);
  const [error, setError] = useState('');

  const loadCart = useCallback(async () => {
    setError('');

    try {
      const data = await getCart();
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Unable to load your cart. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadCart();
  }, [loadCart, token]);

  async function changeQuantity(item, quantity) {
    if (quantity < 1) return;

    setBusyItemId(item.id);
    setError('');

    try {
      await updateCartItem(item.id, quantity);
      await loadCart();
    } catch (err) {
      setError(
        err.response?.data?.error || 'Unable to update the item quantity.',
      );
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleRemove(itemId) {
    setBusyItemId(itemId);
    setError('');

    try {
      await removeCartItem(itemId);
      await loadCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to remove this item.');
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <main className='app cart-page'>
      <div className='cart-heading'>
        <div>
          <p className='eyebrow'>YOUR SELECTION</p>
          <h1>Your shopping cart</h1>
        </div>

        <Link to='/' className='continue-link'>
          Continue shopping
        </Link>
      </div>

      {error && <p className='error-message'>{error}</p>}

      {loading ? (
        <p className='status'>Loading your cart...</p>
      ) : items.length === 0 ? (
        <section className='empty-cart'>
          <span className='empty-cart-icon'>
            <span className='empty-cart-icon-symbol' aria-hidden='true'>
              🛒
            </span>
          </span>
          <h2>Your cart is empty</h2>
          <p>Find something useful for your everyday life.</p>
          <Link to='/' className='primary-button'>
            Explore products
          </Link>
        </section>
      ) : (
        <div className='cart-layout'>
          <section className='cart-items'>
            {items.map((item) => (
              <article className='cart-item' key={item.id}>
                <div className='cart-item-visual'>CC</div>

                <div className='cart-item-details'>
                  <h3>{item.product.name}</h3>
                  <p>{formatPrice(item.product.price)} each</p>

                  <div className='quantity-controls'>
                    <button
                      aria-label={`Decrease quantity of ${item.product.name}`}
                      disabled={busyItemId === item.id || item.quantity <= 1}
                      onClick={() => changeQuantity(item, item.quantity - 1)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      aria-label={`Increase quantity of ${item.product.name}`}
                      disabled={busyItemId === item.id}
                      onClick={() => changeQuantity(item, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className='remove-button'
                    disabled={busyItemId === item.id}
                    onClick={() => handleRemove(item.id)}
                  >
                    {busyItemId === item.id ? 'Updating...' : 'Remove'}
                  </button>
                </div>

                <strong className='cart-line-total'>
                  {formatPrice(item.line_total)}
                </strong>
              </article>
            ))}
          </section>

          <aside className='order-summary'>
            <h2>Order summary</h2>

            <div className='summary-row'>
              <span>Items</span>
              <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>

            <div className='summary-row summary-total'>
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <button
              className='add-button'
              onClick={() =>
                alert('Checkout will be implemented as a later milestone.')
              }
            >
              Proceed to checkout
            </button>

            <p className='summary-note'>
              Checkout is a demo feature. No payment will be processed.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
