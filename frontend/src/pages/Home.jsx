import { useEffect, useState } from 'react';
import { getProducts } from '../api/products';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../api/cart';
import '../App.css';

function App() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingProductId, setAddingProductId] = useState(null);
  const [cartMessage, setCartMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.products);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError(
          'Unable to load products. Please check whether the backend is running.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className='app'>
      <header className='navbar'>
        <Link className='brand' to='/'>
          CloudCart<span>.</span>
        </Link>

        <button
          className='menu-toggle'
          type='button'
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls='primary-navigation'
          onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id='primary-navigation'
          className={mobileMenuOpen ? 'mobile-open' : ''}
          aria-label='Primary navigation'
        >
          <div className='mobile-navigation-header'>
            <Link
              className='brand'
              to='/'
              onClick={() => setMobileMenuOpen(false)}
            >
              CloudCart<span>.</span>
            </Link>
            <button
              className='menu-close'
              type='button'
              aria-label='Close navigation menu'
              onClick={() => setMobileMenuOpen(false)}
            >
              <span />
              <span />
            </button>
          </div>

          <Link
            className='mobile-home-link'
            to='/'
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <a href='#products' onClick={() => setMobileMenuOpen(false)}>
            Products
          </a>

          {isAuthenticated ? (
            <>
              <Link to='/cart' onClick={() => setMobileMenuOpen(false)}>
                Cart
              </Link>
              <span className='nav-user-email'>{user.email}</span>
              <button
                className='cart-button mobile-navigation-logout'
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to='/login' onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link
                to='/register'
                className='cart-button'
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

      </header>

      <main>
        <section className='hero'>
          <p className='eyebrow'>YOUR EVERYDAY MARKETPLACE</p>
          <h1>
            Good finds.
            <br />
            Simple shopping.
          </h1>
          <p>Discover useful everyday essentials, all in one place.</p>
          <a href='#products' className='primary-button'>
            Explore products
          </a>
        </section>

        <section className='products-section' id='products'>
          <div className='section-heading'>
            <div>
              <p className='eyebrow'>THE COLLECTION</p>
              <h2>Explore our products</h2>
            </div>
            {!loading && !error && <span>{products.length} products</span>}
          </div>

          {loading && <p className='status'>Loading products...</p>}

          {error && (
            <div className='error-message'>
              {error}
              <button onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <p className='status'>
              No products found. Seed the database and try again.
            </p>
          )}
          {cartMessage && (
            <p className='status' role='status'>
              {cartMessage}{' '}
              {isAuthenticated && <Link to='/cart'>View cart</Link>}
            </p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className='product-grid'>
              {products.map((product) => (
                <article className='product-card' key={product.id}>
                  <div className='product-visual'>
                    <span>CC</span>
                  </div>

                  <div className='product-info'>
                    <div className='product-title-row'>
                      <h3>{product.name}</h3>
                      <strong>${Number(product.price).toFixed(2)}</strong>
                    </div>

                    <p className='product-description'>
                      {product.description || 'A useful everyday essential.'}
                    </p>

                    <p className='stock'>
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : 'Out of stock'}
                    </p>

                    <button
                      className='add-button'
                      disabled={
                        product.stock <= 0 || addingProductId === product.id
                      }
                      onClick={() => handleAddToCart(product)}
                    >
                      {addingProductId === product.id
                        ? 'Adding...'
                        : product.stock > 0
                          ? 'Add to cart'
                          : 'Out of stock'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className='footer'>
        <span>CloudCart</span>
        <span>Built with React, Flask and MySQL.</span>
      </footer>
    </div>
  );

  async function handleAddToCart(product) {
    setCartMessage('');

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: '/' },
      });
      return;
    }

    setAddingProductId(product.id);

    try {
      await addToCart(product.id, 1);
      setCartMessage(`${product.name} added to your cart.`);
    } catch (err) {
      setCartMessage(
        err.response?.data?.error || 'Unable to add this product to your cart.',
      );
    } finally {
      setAddingProductId(null);
    }
  }
}

export default App;
