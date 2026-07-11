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
    name: string; // Added name field to summary
  };
}

/**
 * Evaluate a single rule against transaction
 * Supports multiple condition types: amount, country, type, pattern
 */
const evaluateRule = (scenario: ScenarioRuleLike, transaction: Record<string, any>): PipelineMatch | null => {
  const params = scenario.parameters || {};
  const reasons: string[] = [];

  // Check amount threshold
  if (params.amountThreshold) {
    const threshold = Number(params.amountThreshold ?? 0);
    const amount = Number(transaction.amount ?? 0);
    if (threshold > 0 && amount >= threshold) {
      reasons.push('amount threshold exceeded');
    }
  }

  // Check amount range (min/max)
  if (params.minAmount != null || params.maxAmount != null) {
    const amount = Number(transaction.amount ?? 0);
    const minAmount = params.minAmount != null ? Number(params.minAmount) : -Infinity;
    const maxAmount = params.maxAmount != null ? Number(params.maxAmount) : Infinity;
    if (Number.isFinite(minAmount) && amount < minAmount) {
      reasons.push(`amount below minimum threshold: ${minAmount}`);
    }
    if (Number.isFinite(maxAmount) && amount > maxAmount) {
      reasons.push(`amount above maximum threshold: ${maxAmount}`);
    }
  }

  // Check country restrictions (blocked countries)
  if (params.blockedCountries) {
    const blockedCountries = Array.isArray(params.blockedCountries)
      ? params.blockedCountries
      : params.blockedCountries.split(',').map((c: string) => c.trim());
    
    const txCountry = transaction.country?.toUpperCase() || '';
    if (blockedCountries.some((c: string) => c.toUpperCase() === txCountry)) {
      reasons.push(`transaction from blocked country: ${txCountry}`);
    }
  }

  // Check transaction type restrictions
  if (params.blockedTransactionTypes) {
    const blockedTypes = Array.isArray(params.blockedTransactionTypes)
      ? params.blockedTransactionTypes
      : params.blockedTransactionTypes.split(',').map((t: string) => t.trim());
    
    const txType = transaction.type?.toLowerCase() || '';
    if (blockedTypes.some((t: string) => t.toLowerCase() === txType)) {
      reasons.push(`blocked transaction type: ${txType}`);
    }
  }

  // Check velocity (number of transactions in short time)
  // This is simplified - in production, you'd query transaction history
  if (params.maxTransactionsPerHour) {
    // For now, we'll skip this as it requires transaction history
    // In future, query recent transactions for this user
  }

  // If any condition triggered, return the match
  if (reasons.length > 0) {
    return {
      title: scenario.title,
      reason: reasons.join(' | '),
    };
  }

  return null;
};

export const evaluateTransactionAgainstScenarios = (
  scenarios: ScenarioRuleLike[],
  transaction: Record<string, any>
): PipelineEvaluationResult => {
  const triggeredScenarios: PipelineMatch[] = [];

  for (const scenario of scenarios) {
    if (scenario.isActive === false) continue;

    const match = evaluateRule(scenario, transaction);
    if (match) {
      triggeredScenarios.push(match);
    }
  }

  return {
    triggeredScenarios,
    summary: {
      totalChecked: scenarios.length,
      triggeredCount: triggeredScenarios.length,
      name: transaction.name || 'N/A', // Assuming transaction has a name field; adjust as needed
    },
  };
};
