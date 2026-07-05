export interface ScenarioRuleLike {
  title: string;
  parameters?: Record<string, any>;
  isActive?: boolean;
}

export interface PipelineMatch {
  title: string;
  reason: string;
}

export interface PipelineEvaluationResult {
  triggeredScenarios: PipelineMatch[];
  summary: {
    totalChecked: number;
    triggeredCount: number;
  };
}

export const evaluateTransactionAgainstScenarios = (
  scenarios: ScenarioRuleLike[],
  transaction: Record<string, any>
): PipelineEvaluationResult => {
  const triggeredScenarios: PipelineMatch[] = [];

  for (const scenario of scenarios) {
    if (scenario.isActive === false) continue;

    const threshold = Number(scenario.parameters?.amountThreshold ?? 0);
    const amount = Number(transaction.amount ?? 0);

    if (threshold > 0 && amount >= threshold) {
      triggeredScenarios.push({
        title: scenario.title,
        reason: 'amount threshold exceeded',
      });
    }
  }

  return {
    triggeredScenarios,
    summary: {
      totalChecked: scenarios.length,
      triggeredCount: triggeredScenarios.length,
    },
  };
};
