import api from './api';
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth';

export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  const { data } = await api.post('/auth/login', credentials);
  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

export const registerUser = async (credentials: RegisterCredentials): Promise<User> => {
  const { data } = await api.post('/auth/register', credentials);
  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem('user');
};