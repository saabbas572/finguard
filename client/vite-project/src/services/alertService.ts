/**
 * Alerts Service
 * ==============
 * API calls for alert management
 */

import api from './api';

export interface Alert {
  _id: string;
  userId: string;
  scenarioTitle: string;
  reason: string;
  transactionData: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlertStats {
  total: number;
  unresolved: number;
  high: number;
}

/**
 * Get All Alerts
 */
export const getAlertsAPI = async (filters?: {
  isResolved?: boolean;
  severity?: string;
  sort?: 'newest' | 'oldest';
}): Promise<Alert[]> => {
  const params = new URLSearchParams();

  if (filters?.isResolved !== undefined) {
    params.append('isResolved', String(filters.isResolved));
  }
  if (filters?.severity) {
    params.append('severity', filters.severity);
  }
  if (filters?.sort) {
    params.append('sort', filters.sort);
  }

  const queryString = params.toString();
  const url = queryString ? `/alerts?${queryString}` : '/alerts';

  const { data } = await api.get(url);
  return data;
};

/**
 * Get Alert Stats
 */
export const getAlertStatsAPI = async (): Promise<AlertStats> => {
  const { data } = await api.get('/alerts/stats');
  return data;
};

/**
 * Resolve Alert
 */
export const resolveAlertAPI = async (id: string): Promise<Alert> => {
  const { data } = await api.patch(`/alerts/${id}/resolve`);
  return data;
};

/**
 * Delete Alert
 */
export const deleteAlertAPI = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/alerts/${id}`);
  return data;
};
