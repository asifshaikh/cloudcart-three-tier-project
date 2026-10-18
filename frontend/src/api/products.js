import api from './axios';

export const getProducts = async () => {
  try {
    const response = await api.get('/api/products');
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
