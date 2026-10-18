import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loadingUser } = useAuth();

  if (loadingUser) {
    return <p className='status'>Checking your session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return children;
}

function CartPlaceholder() {
  return (
    <main className='app auth-page'>
      <div>
        <p className='eyebrow'>YOUR SHOPPING CART</p>
        <h1>Cart integration comes next.</h1>
        <p className='status'>
          Your account is authenticated. We'll connect this page to the Flask
          cart APIs in the next step.
        </p>
      </div>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />

      <Route path='/login' element={<AuthPage mode='login' />} />

      <Route path='/register' element={<AuthPage mode='register' />} />

      <Route
        path='/cart'
        element={
          <ProtectedRoute>
            <CartPlaceholder />
          </ProtectedRoute>
        }
      />

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
