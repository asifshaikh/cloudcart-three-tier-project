import api from './axios';

export const registerUser = async (email, password) => {
  const response = await api.post('/api/auth/register', {
    email,
    password,
  });

  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  });

  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await api.get('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.user;
};
