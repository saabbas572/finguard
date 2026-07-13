import api from './api';

export interface EvaluationResult {
  triggeredScenarios: Array<{
    title: string;
    reason: string;
  }>;
  summary: {
    totalChecked: number;
    triggeredCount: number;
  };
}

export interface EvaluationResponse {
  result: EvaluationResult;
  ingestedTransactions: Array<Record<string, any>>;
  source: string;
}

export const evaluateTransactionAPI = async (transaction: Record<string, any>): Promise<EvaluationResponse> => {
  const { data } = await api.post('/pipeline/evaluate', { transaction });
  return data;
};

export const evaluateIntegrationTransactionsAPI = async (limit: number = 10) => {
  const { data } = await api.post('/pipeline/evaluate-integration', { limit });
  return data;
};
