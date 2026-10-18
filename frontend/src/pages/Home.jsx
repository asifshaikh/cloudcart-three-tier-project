import { useEffect, useState } from 'react';
import { getProducts } from '../api/products';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  return (
    <div className='app'>
      <header className='navbar'>
        <Link className='brand' to='/'>
          CloudCart<span>.</span>
        </Link>

        <nav>
          <a href='#products'>Products</a>

          {isAuthenticated ? (
            <>
              <Link to='/cart'>Cart</Link>
              <span>{user.email}</span>
              <button className='cart-button' onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to='/login'>Login</Link>
              <Link to='/register' className='cart-button'>
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
                      disabled={product.stock <= 0}
                      onClick={() =>
                        alert('Cart functionality is coming in the next step!')
                      }
                    >
                      {product.stock > 0 ? 'Add to cart' : 'Out of stock'}
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
}

export default App;
