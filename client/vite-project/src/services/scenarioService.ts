/**
 * Scenario Service
 * ================
 * Contains all API calls related to scenarios
 * 
 * Communication Flow:
 * React components/pages → THIS FILE (scenarioService) → api.ts → Backend
 */

import api from './api';

/**
 * Scenario Interface
 * Used for type safety throughout the app
 */
export interface Scenario {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'retirement' | 'investment' | 'debt-payoff' | 'savings' | 'custom';
  severity: 'low' | 'medium' | 'high';
  parameters: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Scenario
 * ---------------
 * POST /api/scenarios
 * 
 * Creates a new scenario for the logged-in user
 */
export const createScenarioAPI = async (scenarioData: {
  title: string;
  description?: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  parameters?: Record<string, any>;
}): Promise<Scenario> => {
  const { data } = await api.post('/scenarios', scenarioData);
  return data;
};

/**
 * Get All Scenarios
 * ----------------
 * GET /api/scenarios
 * 
 * Fetches all scenarios for the logged-in user
 * Optional filtering and sorting
 */
export const getScenariosAPI = async (filters?: {
  isActive?: boolean;
  type?: string;
  sort?: 'newest' | 'oldest';
}): Promise<Scenario[]> => {
  const params = new URLSearchParams();
  
  if (filters?.isActive !== undefined) {
    params.append('isActive', String(filters.isActive));
  }
  if (filters?.type) {
    params.append('type', filters.type);
  }
  if (filters?.sort) {
    params.append('sort', filters.sort);
  }

  const queryString = params.toString();
  const url = queryString ? `/scenarios?${queryString}` : '/scenarios';
  
  const { data } = await api.get(url);
  return data;
};

/**
 * Get Single Scenario
 * ------------------
 * GET /api/scenarios/:id
 * 
 * Fetches a specific scenario by ID
 */
export const getScenarioByIdAPI = async (id: string): Promise<Scenario> => {
  const { data } = await api.get(`/scenarios/${id}`);
  return data;
};

/**
 * Update Scenario
 * ---------------
 * PUT /api/scenarios/:id
 * 
 * Updates a scenario's details
 */
export const updateScenarioAPI = async (
  id: string,
  updates: {
    title?: string;
    description?: string;
    type?: string;
    severity?: 'low' | 'medium' | 'high';
    parameters?: Record<string, any>;
  }
): Promise<Scenario> => {
  const { data } = await api.put(`/scenarios/${id}`, updates);
  return data;
};

/**
 * Delete Scenario
 * ---------------
 * DELETE /api/scenarios/:id
 * 
 * Permanently deletes a scenario
 */
export const deleteScenarioAPI = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/scenarios/${id}`);
  return data;
};

/**
 * Toggle Scenario Active Status
 * ----------------------------
 * PATCH /api/scenarios/:id/toggle
 * 
 * Toggles isActive: true → false, false → true
 */
export const toggleScenarioAPI = async (id: string): Promise<Scenario> => {
  const { data } = await api.patch(`/scenarios/${id}/toggle`);
  return data;
};
