import api from './axios';

export const getCart = async () => {
  const response = await api.get('/api/cart');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/api/cart/items', {
    product_id: productId,
    quantity,
  });

  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.patch(`/api/cart/items/${itemId}`, {
    quantity,
  });

  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/api/cart/items/${itemId}`);
  return response.data;
};
