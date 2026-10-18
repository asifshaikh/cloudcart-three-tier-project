import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthPage from './AuthPage';

const { mockLogin, mockRegisterUser, mockUseAuth } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockRegisterUser: vi.fn(),
  mockUseAuth: vi.fn(),
}));

vi.mock('../api/auth', () => ({
  registerUser: mockRegisterUser,
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

function LocationDisplay() {
  const location = useLocation();

  return <div data-testid='current-location'>{location.pathname}</div>;
}

function renderAuthPage(mode, initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry || `/${mode}`]}>
      <Routes>
        <Route path='/login' element={<AuthPage mode='login' />} />
        <Route path='/register' element={<AuthPage mode='register' />} />
        <Route path='/' element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CloudCart authentication pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockLogin.mockResolvedValue({
      access_token: 'test-access-token',
      user: {
        id: 1,
        email: 'test@example.com',
      },
    });

    mockRegisterUser.mockResolvedValue({
      message: 'Registration successful.',
    });

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });
  });

  it('submits registration with the email and password', async () => {
    const user = userEvent.setup();

    renderAuthPage('register');

    await user.type(
      screen.getByLabelText(/email address/i),
      'newuser@example.com',
    );

    await user.type(screen.getByLabelText(/password/i), 'CloudCart123!');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith(
        'newuser@example.com',
        'CloudCart123!',
      );
    });

    expect(
      screen.getByText('Account created successfully. You can now log in.'),
    ).toBeInTheDocument();
  });

  it('displays an error when registration fails', async () => {
    const user = userEvent.setup();

    mockRegisterUser.mockRejectedValue({
      response: {
        data: {
          error: 'An account with this email already exists.',
        },
      },
    });

    renderAuthPage('register');

    await user.type(
      screen.getByLabelText(/email address/i),
      'existing@example.com',
    );

    await user.type(screen.getByLabelText(/password/i), 'CloudCart123!');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText('An account with this email already exists.'),
    ).toBeInTheDocument();
  });

  it('logs in successfully and navigates to the home page', async () => {
    const user = userEvent.setup();

    renderAuthPage('login');

    await user.type(
      screen.getByLabelText(/email address/i),
      'test@example.com',
    );

    await user.type(screen.getByLabelText(/password/i), 'CloudCart123!');

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        'test@example.com',
        'CloudCart123!',
      );
    });

    expect(await screen.findByTestId('current-location')).toHaveTextContent(
      '/',
    );
  });

  it('displays an error when login fails', async () => {
    const user = userEvent.setup();

    mockLogin.mockRejectedValue({
      response: {
        data: {
          error: 'Invalid email or password.',
        },
      },
    });

    renderAuthPage('login');

    await user.type(
      screen.getByLabelText(/email address/i),
      'wrong@example.com',
    );

    await user.type(screen.getByLabelText(/password/i), 'WrongPassword123!');

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText('Invalid email or password.'),
    ).toBeInTheDocument();
  });

  it('disables the submit button while registration is pending', async () => {
    const user = userEvent.setup();

    mockRegisterUser.mockReturnValue(new Promise(() => {}));

    renderAuthPage('register');

    await user.type(
      screen.getByLabelText(/email address/i),
      'newuser@example.com',
    );

    await user.type(screen.getByLabelText(/password/i), 'CloudCart123!');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByRole('button', { name: /please wait/i })).toBeDisabled();
  });
});
