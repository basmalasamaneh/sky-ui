const API_URL = '/api/v1';

export const cartService = {
  async getCart(cartId) {
    const token = localStorage.getItem('token');
    if (!token) return { status: 'error', message: 'No token' };
    const res = await fetch(`${API_URL}/cart/${cartId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getCartByUserId(userId) {
    const token = localStorage.getItem('token');
    if (!token) return { status: 'error', message: 'No token' };
    const res = await fetch(`${API_URL}/cart/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async addItem(cartId, artworkId, quantity = 1) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/cart/${cartId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ artworkId, quantity })
    });
    return res.json();
  },

  async removeItem(cartId, itemId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/cart/${cartId}/items/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async updateQuantity(cartId, itemId, quantity) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/cart/${cartId}/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity })
    });
    return res.json();
  }
};
