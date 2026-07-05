import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import scenarioReducer from './scenarioSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    scenarios: scenarioReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;