const API_URL = '/api/v1';

export const orderService = {
  async checkout(userId, shippingDetails) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/orders/${userId}/checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(shippingDetails)
    });
    return res.json();
  },

  async getMyOrders(userId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/orders/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.json();
  },

  async updateStatus(orderId, status) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};
