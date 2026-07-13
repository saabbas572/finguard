export interface ScenarioRuleLike {
  title: string;
  parameters?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high'; // User-defined severity level
  isActive?: boolean;
}

export interface PipelineMatch {
  title: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
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
  let isMatch = false;

  // Check amount threshold
  if (params.amountThreshold) {
    const threshold = Number(params.amountThreshold ?? 0);
    const amount = Number(transaction.amount ?? 0);
    if (threshold > 0 && amount >= threshold) {
      reasons.push('amount threshold exceeded');
      isMatch = true;
    }
  }

  // Check amount range (min/max) - MATCH if amount is INSIDE range
  if (params.minAmount != null || params.maxAmount != null) {
    const amount = Number(transaction.amount ?? 0);
    const minAmount = params.minAmount != null ? Number(params.minAmount) : -Infinity;
    const maxAmount = params.maxAmount != null ? Number(params.maxAmount) : Infinity;
    
    // Amount is inside range if it's >= minAmount AND <= maxAmount
    if (amount >= minAmount && amount <= maxAmount) {
      reasons.push(`amount in range: $${minAmount} - $${maxAmount}`);
      isMatch = true;
    } else {
      // Amount is outside range - not a match
      return null;
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
      isMatch = true;
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
      isMatch = true;
    }
  }

  // If any condition triggered, return the match
  if (isMatch && reasons.length > 0) {
    // Use severity level set by user when creating scenario, default to 'medium'
    const severity = scenario.severity || 'medium';
    
    return {
      title: scenario.title,
      reason: reasons.join(' | '),
      severity,
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
