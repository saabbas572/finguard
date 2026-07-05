/**
 * Scenario Redux Slice
 * ====================
 * Manages global state for scenarios
 * 
 * State Structure:
 * {
 *   scenarios: Scenario[],
 *   selectedScenario: Scenario | null,
 *   loading: boolean,
 *   error: string | null
 * }
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Scenario } from '../services/scenarioService';
import {
  createScenarioAPI,
  getScenariosAPI,
  getScenarioByIdAPI,
  updateScenarioAPI,
  deleteScenarioAPI,
  toggleScenarioAPI,
} from '../services/scenarioService';

/**
 * State Interface
 */
interface ScenarioState {
  scenarios: Scenario[];
  selectedScenario: Scenario | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial State
 */
const initialState: ScenarioState = {
  scenarios: [],
  selectedScenario: null,
  loading: false,
  error: null,
};

/**
 * Async Thunks - API Calls
 * These automatically generate pending/fulfilled/rejected actions
 */

/**
 * Create Scenario Thunk
 * Called when user submits form to create new scenario
 */
export const createScenario = createAsyncThunk(
  'scenarios/create',
  async (
    scenarioData: {
      title: string;
      description?: string;
      type: string;
      parameters?: Record<string, any>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await createScenarioAPI(scenarioData);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create scenario');
    }
  }
);

/**
 * Fetch All Scenarios Thunk
 * Called when component mounts to load all scenarios
 */
export const fetchScenarios = createAsyncThunk(
  'scenarios/fetchAll',
  async (
    filters?: {
      isActive?: boolean;
      type?: string;
      sort?: 'newest' | 'oldest';
    },
    { rejectWithValue }
  ) => {
    try {
      return await getScenariosAPI(filters);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch scenarios');
    }
  }
);

/**
 * Fetch Single Scenario Thunk
 * Called when user clicks on a scenario to view details
 */
export const fetchScenarioById = createAsyncThunk(
  'scenarios/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await getScenarioByIdAPI(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch scenario');
    }
  }
);

/**
 * Update Scenario Thunk
 * Called when user edits a scenario
 */
export const updateScenario = createAsyncThunk(
  'scenarios/update',
  async (
    {
      id,
      updates,
    }: {
      id: string;
      updates: {
        title?: string;
        description?: string;
        type?: string;
        parameters?: Record<string, any>;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      return await updateScenarioAPI(id, updates);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update scenario');
    }
  }
);

/**
 * Delete Scenario Thunk
 * Called when user deletes a scenario
 */
export const deleteScenario = createAsyncThunk(
  'scenarios/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteScenarioAPI(id);
      return id; // Return the ID to remove from state
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete scenario');
    }
  }
);

/**
 * Toggle Scenario Thunk
 * Called when user clicks toggle active/inactive
 */
export const toggleScenario = createAsyncThunk(
  'scenarios/toggle',
  async (id: string, { rejectWithValue }) => {
    try {
      return await toggleScenarioAPI(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle scenario');
    }
  }
);

/**
 * Redux Slice
 */
const scenarioSlice = createSlice({
  name: 'scenarios',
  initialState,
  
  // Synchronous actions
  reducers: {
    /**
     * Select Scenario
     * Called when user clicks on a scenario
     */
    selectScenario(state, action) {
      state.selectedScenario = action.payload;
    },

    /**
     * Clear Selected Scenario
     * Called when user closes scenario detail view
     */
    clearSelectedScenario(state) {
      state.selectedScenario = null;
    },

    /**
     * Clear Error
     * Called when user dismisses error message
     */
    clearError(state) {
      state.error = null;
    },
  },

  // Asynchronous action handlers
  extraReducers: (builder) => {
    // CREATE SCENARIO
    builder
      .addCase(createScenario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createScenario.fulfilled, (state, action) => {
        state.loading = false;
        state.scenarios.unshift(action.payload); // Add to beginning of list
        state.selectedScenario = action.payload;
        state.error = null;
      })
      .addCase(createScenario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // FETCH ALL SCENARIOS
    builder
      .addCase(fetchScenarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScenarios.fulfilled, (state, action) => {
        state.loading = false;
        state.scenarios = action.payload;
        state.error = null;
      })
      .addCase(fetchScenarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // FETCH SINGLE SCENARIO
    builder
      .addCase(fetchScenarioById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScenarioById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedScenario = action.payload;
        state.error = null;
      })
      .addCase(fetchScenarioById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // UPDATE SCENARIO
    builder
      .addCase(updateScenario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateScenario.fulfilled, (state, action) => {
        state.loading = false;
        // Update in scenarios list
        const index = state.scenarios.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.scenarios[index] = action.payload;
        }
        // Update selected scenario
        if (state.selectedScenario?._id === action.payload._id) {
          state.selectedScenario = action.payload;
        }
        state.error = null;
      })
      .addCase(updateScenario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // DELETE SCENARIO
    builder
      .addCase(deleteScenario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteScenario.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from scenarios list
        state.scenarios = state.scenarios.filter((s) => s._id !== action.payload);
        // Clear selection if deleted scenario was selected
        if (state.selectedScenario?._id === action.payload) {
          state.selectedScenario = null;
        }
        state.error = null;
      })
      .addCase(deleteScenario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // TOGGLE SCENARIO
    builder
      .addCase(toggleScenario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleScenario.fulfilled, (state, action) => {
        state.loading = false;
        // Update in scenarios list
        const index = state.scenarios.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.scenarios[index] = action.payload;
        }
        // Update selected scenario
        if (state.selectedScenario?._id === action.payload._id) {
          state.selectedScenario = action.payload;
        }
        state.error = null;
      })
      .addCase(toggleScenario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { selectScenario, clearSelectedScenario, clearError } = scenarioSlice.actions;

// Export reducer
export default scenarioSlice.reducer;
