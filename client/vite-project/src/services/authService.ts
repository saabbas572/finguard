/**
 * Authentication Service
 * ======================
 * This file contains all API calls related to authentication.
 * 
 * Communication Flow:
 * Auth context/hooks → THIS FILE (authService) → api.ts → Backend Server
 * 
 * After receiving response from backend:
 * → Stores user data in localStorage
 * → Returns data back to caller for state management
 */

import api from './api';
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth';

/**
 * Login User
 * ----------
 * 1. Takes email and password from user
 * 2. Sends POST request to backend /auth/login endpoint
 * 3. Backend validates credentials and returns user data + JWT token
 * 4. Stores response in localStorage for persistence
 * 5. Returns user data to caller for state update
 */
export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  const { data } = await api.post('/auth/login', credentials);
  // Store in localStorage so token is available for future requests (via api.ts interceptor)
  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

/**
 * Register User
 * -----------
 * Same flow as login:
 * 1. Takes name, email, password, role from user
 * 2. Sends POST request to backend /auth/register endpoint
 * 3. Backend creates new user and returns user data + JWT token
 * 4. Stores response in localStorage
 * 5. Returns user data to caller
 */
export const registerUser = async (credentials: RegisterCredentials): Promise<User> => {
  const { data } = await api.post('/auth/register', credentials);
  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

/**
 * Logout User
 * -----------
 * 1. Called when user clicks logout
 * 2. Removes user data from localStorage
 * 3. Caller clears local auth state (sets user to null)
 * 4. Next API requests won't have Authorization header (no token in localStorage)
 */
export const logoutUser = () => {
  localStorage.removeItem('user');
};