const test = require('node:test');
const { mock } = require('node:test');
const assert = require('node:assert/strict');

const Scenario = require('../src/models/Scenario.ts').default;
const {
  createScenario,
  getScenarios,
  updateScenario,
  deleteScenario,
  toggleScenarioActive,
} = require('../src/controllers/scenarioController.ts');

test('createScenario stores a user scenario and returns 201', async () => {
  const createdScenario = {
    _id: 'scenario_1',
    userId: 'user_123',
    title: 'High-value transfer',
    description: 'flag large transfers',
    type: 'custom',
    parameters: { amountThreshold: 5000 },
    isActive: true,
  };

  mock.method(Scenario, 'create', async () => createdScenario);

  const req: any = {
    user: 'user_123',
    body: {
      title: 'High-value transfer',
      description: 'flag large transfers',
      type: 'custom',
      parameters: { amountThreshold: 5000 },
    },
  };

  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };

  await createScenario(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.title, 'High-value transfer');
  mock.restoreAll();
});

test('getScenarios returns only the current user scenarios', async () => {
  mock.method(Scenario, 'find', () => ({
    sort: () => ({
      exec: async () => [{ _id: 'scenario_1', title: 'High-risk region', userId: 'user_123' }],
    }),
  }));

  const req: any = { user: 'user_123', query: {} };
  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };

  await getScenarios(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].title, 'High-risk region');
  mock.restoreAll();
});

test('updateScenario changes the stored values', async () => {
  const scenario = {
    userId: 'user_123',
    title: 'Old title',
    description: 'before',
    type: 'custom',
    severity: 'medium',
    parameters: { amountThreshold: 10 },
    save: async function () {
      return this;
    },
  };

  mock.method(Scenario, 'findById', async () => scenario);

  const req: any = {
    user: 'user_123',
    params: { id: 'scenario_1' },
    body: {
      title: 'Updated title',
      severity: 'high',
      parameters: { amountThreshold: 2500 },
    },
  };

  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };

  await updateScenario(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.title, 'Updated title');
  assert.equal(res.body.severity, 'high');
  assert.equal(res.body.parameters.amountThreshold, 2500);
  mock.restoreAll();
});

test('deleteScenario removes a scenario belonging to the user', async () => {
  const scenario = {
    userId: 'user_123',
  };

  mock.method(Scenario, 'findById', async () => scenario);
  mock.method(Scenario, 'findByIdAndDelete', async () => ({ deleted: true }));

  const req: any = {
    user: 'user_123',
    params: { id: 'scenario_1' },
  };

  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };

  await deleteScenario(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, 'Scenario deleted successfully');
  mock.restoreAll();
});

test('toggleScenarioActive flips the scenario status', async () => {
  const scenario = {
    userId: 'user_123',
    isActive: true,
    save: async function () {
      return { ...this, isActive: false };
    },
  };

  mock.method(Scenario, 'findById', async () => scenario);

  const req: any = {
    user: 'user_123',
    params: { id: 'scenario_1' },
  };

  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };

  await toggleScenarioActive(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.isActive, false);
  mock.restoreAll();
});
