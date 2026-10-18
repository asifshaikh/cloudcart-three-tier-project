import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        await registerUser(email.trim(), password);

        setMessage('Account created successfully. You can now log in.');
        setPassword('');
      } else {
        await login(email.trim(), password);
        navigate('/', { replace: true });
      }
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.error ||
          data?.message ||
          'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className='auth-page'>
      <div className='auth-card'>
        <Link className='brand' to='/'>
          CloudCart<span>.</span>
        </Link>

        <p className='eyebrow'>
          {isRegister ? 'JOIN CLOUDCART' : 'WELCOME BACK'}
        </p>

        <h1>{isRegister ? 'Create your account' : 'Sign in'}</h1>

        <p className='auth-description'>
          {isRegister
            ? 'Create an account to start shopping.'
            : 'Sign in to access your account and cart.'}
        </p>

        {message && <p className='success-message'>{message}</p>}
        {error && <p className='error-message'>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor='email'>Email address</label>
          <input
            id='email'
            type='email'
            autoComplete='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder='you@example.com'
            required
          />

          <label htmlFor='password'>Password</label>
          <input
            id='password'
            type='password'
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
            minLength={isRegister ? 8 : undefined}
            required
          />

          <button
            className='add-button auth-submit'
            type='submit'
            disabled={submitting}
          >
            {submitting
              ? 'Please wait...'
              : isRegister
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <p className='auth-switch'>
          {isRegister ? 'Already have an account?' : 'New to CloudCart?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </div>
    </main>
  );
}
