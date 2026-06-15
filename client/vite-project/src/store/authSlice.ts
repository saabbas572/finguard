import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, logoutUser } from '../services/authService';
import type { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';

const storedUser = localStorage.getItem('user');
const devBypassEnabled = import.meta.env.DEV && localStorage.getItem('dev_auth_bypass') === 'true';
const devMockUser = {
  name: 'Dev User',
  email: 'dev@local',
  token: 'devtoken',
};

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : devBypassEnabled ? devMockUser : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    return await loginUser(credentials);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (credentials: RegisterCredentials, { rejectWithValue }) => {
  try {
    return await registerUser(credentials);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      logoutUser();
      state.user = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;