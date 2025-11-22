import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getCurrentUser = () => api.get('/auth/me');

// Categories
export const getCategories = () => api.get('/categories');

// Items
export const getItems = (params) => api.get('/items', { params });
export const getItem = (id) => api.get(`/items/${id}`);
export const createItem = (data) => api.post('/items', data);
export const getMyItems = () => api.get('/items/my-items');

// Rentals
export const createRental = (data) => api.post('/rentals', data);
export const getMyRentals = () => api.get('/rentals/my-rentals');
export const approveRental = (id) => api.patch(`/rentals/${id}/approve`);
export const verifyPickup = (id) => api.patch(`/rentals/${id}/verify-pickup`);
export const verifyReturn = (id) => api.patch(`/rentals/${id}/verify-return`);

// Messages
export const getMessages = (rentalId) => api.get('/messages', { params: { rental_id: rentalId } });
export const sendMessage = (data) => api.post('/messages', data);

// Reviews
export const createReview = (data) => api.post('/reviews', data);

// Dashboard
export const getEarnings = () => api.get('/dashboard/earnings');

export default api;
