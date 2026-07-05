/**
 * Redux Auth Slice
 * ================
 * This is the Redux state management for authentication.
 * 
 * Communication Flow (Complete):
 * 
 * 1. User enters credentials in Login.tsx
 * 2. Login.tsx dispatches: dispatch(login(credentials))
 * 3. Redux calls this file's login() async thunk
 * 4. This calls authService.loginUser()
 * 5. authService.loginUser() calls api.post() to backend
 * 6. Backend responds with user data + token
 * 7. authService stores in localStorage
 * 8. authService returns data to this Redux thunk
 * 9. Redux updates state (state.user = response)
 * 10. Login.tsx reads updated state and navigates to dashboard
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, logoutUser } from '../services/authService';
import type { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';

// Check if user was previously logged in (persistent login)
const storedUser = localStorage.getItem('user');
const devBypassEnabled = import.meta.env.DEV && localStorage.getItem('dev_auth_bypass') === 'true';
const devMockUser = {
  name: 'Dev User',
  email: 'dev@local',
  token: 'devtoken',
};

const initialState: AuthState = {
  // If user exists in localStorage, restore them; otherwise null
  user: storedUser ? JSON.parse(storedUser) : devBypassEnabled ? devMockUser : null,
  loading: false,
  error: null,
};

/**
 * Login Async Thunk
 * ----------------
 * Called from Login component when user submits form
 * 
 * Flow:
 * 1. Receives credentials (email, password)
 * 2. Calls authService.loginUser()
 * 3. Returns user data on success
 * 4. Returns error message on failure
 */
export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    return await loginUser(credentials);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

/**
 * Register Async Thunk
 * -------------------
 * Called from Register component when user submits form
 * Same flow as login
 */
export const register = createAsyncThunk('auth/register', async (credentials: RegisterCredentials, { rejectWithValue }) => {
  try {
    return await registerUser(credentials);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

/**
 * Auth Slice
 * ----------
 * Defines the Redux state and how it changes
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  
  // Synchronous actions (called immediately)
  reducers: {
    /**
     * Logout reducer
     * Called when user clicks logout button
     * 1. Calls authService.logoutUser() to clear localStorage
     * 2. Sets state.user to null
     * 3. Clears any error messages
     */
    logout(state) {
      logoutUser();
      state.user = null;
      state.error = null;
    },
    
    /**
     * Clear error reducer
     * Called when user dismisses error message
     */
    clearError(state) {
      state.error = null;
    },
  },
  
  // Asynchronous action handlers (for login/register)
  extraReducers: (builder) => {
    builder
      // LOGIN FLOW
      .addCase(login.pending, (state) => { 
        // While waiting for backend response
        state.loading = true; 
        state.error = null; 
      })
      .addCase(login.fulfilled, (state, action) => { 
        // Backend returned success - update state with user data
        state.loading = false; 
        state.user = action.payload; 
      })
      .addCase(login.rejected, (state, action) => { 
        // Backend returned error
        state.loading = false; 
        state.error = action.payload as string; 
      })
      
      // REGISTER FLOW (same pattern as login)
      .addCase(register.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(register.fulfilled, (state, action) => { 
        state.loading = false; 
        state.user = action.payload; 
      })
      .addCase(register.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;