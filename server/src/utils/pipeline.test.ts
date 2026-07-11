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
  assert.match(result.triggeredScenarios[0].reason, /amount threshold exceeded/);
});

test('flags transactions from blocked countries', () => {
  const result = evaluateTransactionAgainstScenarios(
    [
      {
        title: 'High-risk country restriction',
        parameters: { blockedCountries: ['IR', 'SY', 'KP'] },
        isActive: true,
      },
    ],
    { amount: 100, type: 'transfer', country: 'IR' }
  );

  assert.equal(result.triggeredScenarios.length, 1);
  assert.equal(result.triggeredScenarios[0].title, 'High-risk country restriction');
  assert.match(result.triggeredScenarios[0].reason, /blocked country/);
});

test('flags transactions outside configured amount range', () => {
  const result = evaluateTransactionAgainstScenarios(
    [
      {
        title: 'Amount range guard',
        parameters: { minAmount: 1000, maxAmount: 5000 },
        isActive: true,
      },
    ],
    { amount: 6000, type: 'transfer', country: 'US' }
  );

  assert.equal(result.triggeredScenarios.length, 1);
  assert.match(result.triggeredScenarios[0].reason, /amount above maximum threshold/);
});

test('flags blocked transaction types', () => {
  const result = evaluateTransactionAgainstScenarios(
    [
      {
        title: 'Block crypto transfers',
        parameters: { blockedTransactionTypes: ['crypto_transfer', 'wire'] },
        isActive: true,
      },
    ],
    { amount: 5000, type: 'crypto_transfer', country: 'US' }
  );

  assert.equal(result.triggeredScenarios.length, 1);
  assert.match(result.triggeredScenarios[0].reason, /blocked transaction type/);
});

test('combines multiple rule conditions', () => {
  const result = evaluateTransactionAgainstScenarios(
    [
      {
        title: 'Multi-condition rule',
        parameters: {
          amountThreshold: 5000,
          blockedCountries: ['CN'],
        },
        isActive: true,
      },
    ],
    { amount: 6000, type: 'transfer', country: 'CN' }
  );

  assert.equal(result.triggeredScenarios.length, 1);
  const reason = result.triggeredScenarios[0].reason;
  assert.match(reason, /amount threshold exceeded/);
  assert.match(reason, /blocked country/);
});

test('does not flag transactions that do not match rules', () => {
  const result = evaluateTransactionAgainstScenarios(
    [
      {
        title: 'Large transfer only',
        parameters: { amountThreshold: 5000 },
        isActive: true,
      },
    ],
    { amount: 2000, type: 'transfer', country: 'US' }
  );

  assert.equal(result.triggeredScenarios.length, 0);
});

test('respects isActive flag', () => {
  const result = evaluateTransactionAgainstScenarios(
    [
      {
        title: 'Inactive rule',
        parameters: { amountThreshold: 5000 },
        isActive: false,
      },
    ],
    { amount: 6000, type: 'transfer', country: 'US' }
  );

  assert.equal(result.triggeredScenarios.length, 0);
});
