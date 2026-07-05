import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTransactionAgainstScenarios } from './pipeline.ts';

test('flags high-volume transfers above threshold', () => {
  const result = evaluateTransactionAgainstScenarios(
    [
      {
        title: 'Large transfer',
        parameters: { amountThreshold: 5000 },
        isActive: true,
      },
    ],
    { amount: 6000, type: 'transfer', country: 'US' }
  );

  assert.equal(result.triggeredScenarios.length, 1);
  assert.equal(result.triggeredScenarios[0].title, 'Large transfer');
  assert.equal(result.triggeredScenarios[0].reason, 'amount threshold exceeded');
});
