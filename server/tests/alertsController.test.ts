const test = require('node:test');
const { mock } = require('node:test');
const assert = require('node:assert/strict');

const Alert = require('../src/models/Alert.ts').default;
const {
  getAlerts,
  resolveAlert,
  deleteAlert,
  getAlertStats,
} = require('../src/controllers/alertsController.ts');

test('getAlerts returns alerts for the current user', async () => {
  mock.method(Alert, 'find', () => ({
    sort: () => ({
      lean: async () => [{ _id: 'alert_1', userId: 'user_123', severity: 'high' }],
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

  await getAlerts(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].severity, 'high');
  mock.restoreAll();
});

test('getAlerts applies severity and date range filters', async () => {
  let capturedFilter: any = null;

  mock.method(Alert, 'find', (filter: any) => {
    capturedFilter = filter;
    return {
      sort: () => ({
        lean: async () => [{
          _id: 'alert_2',
          userId: 'user_123',
          severity: 'low',
          createdAt: '2026-08-10T00:00:00.000Z',
        }],
      }),
    };
  });

  const req: any = {
    user: 'user_123',
    query: {
      severity: 'low',
      from: '2026-08-01',
      to: '2026-08-12',
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

  await getAlerts(req, res);

  assert.deepEqual(capturedFilter.severity, 'low');
  assert.ok(capturedFilter.createdAt.$gte instanceof Date);
  assert.ok(capturedFilter.createdAt.$lte instanceof Date);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body[0].severity, 'low');
  mock.restoreAll();
});

test('resolveAlert marks an alert as resolved', async () => {
  const alert = {
    userId: 'user_123',
    isResolved: false,
    save: async function () {
      this.isResolved = true;
      return this;
    },
  };

  mock.method(Alert, 'findById', async () => alert);

  const req: any = {
    user: 'user_123',
    params: { id: 'alert_1' },
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

  await resolveAlert(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.isResolved, true);
  mock.restoreAll();
});

test('deleteAlert removes the selected alert', async () => {
  const alert = { userId: 'user_123' };

  mock.method(Alert, 'findById', async () => alert);
  mock.method(Alert, 'findByIdAndDelete', async () => ({ deleted: true }));

  const req: any = {
    user: 'user_123',
    params: { id: 'alert_1' },
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

  await deleteAlert(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, 'Alert deleted successfully');
  mock.restoreAll();
});

test('getAlertStats returns the current totals', async () => {
  mock.method(Alert, 'countDocuments', async (query: any) => {
    if (query.isResolved === false) return 3;
    if (query.severity === 'high') return 2;
    return 5;
  });

  const req: any = { user: 'user_123' };
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

  await getAlertStats(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.total, 5);
  assert.equal(res.body.unresolved, 3);
  assert.equal(res.body.high, 2);
  mock.restoreAll();
});
