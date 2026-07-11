/**
 * API Service Module
 * ==================
 * This is the HTTP client for all backend communication.
 * 
 * Communication Flow:
 * React components/context → authService.ts → api.ts (THIS FILE) → Backend Server
 * 
 * Responsibilities:
 * 1. Creates an Axios instance with the backend URL
 * 2. Automatically adds JWT token to request headers from localStorage
 * 3. All other services (authService, etc.) use this client
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

/**
 * Request Interceptor
 * Automatically attaches JWT token to all requests
 * 
 * How it works:
 * 1. Gets stored user from localStorage (set by authService after login)
 * 2. Extracts token from user object
 * 3. Adds Authorization header: "Bearer <token>"
 * 4. All subsequent API calls include this header
 */
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const { token } = JSON.parse(user);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;