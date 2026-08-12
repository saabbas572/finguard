const test = require('node:test');
const { mock } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../src/models/User.ts').default;
const { register, login } = require('../src/controllers/authController.ts');

test('register creates a user and returns a token', async () => {
  mock.method(User, 'findOne', async () => null);
  mock.method(bcrypt, 'hash', async () => 'hashed-password');
  mock.method(User, 'create', async () => ({
    _id: 'user_123',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'analyst',
    password: 'hashed-password',
  }));
  mock.method(jwt, 'sign', () => 'jwt-token');

  const req: any = {
    body: {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
      role: 'analyst',
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

  await register(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.email, 'alice@example.com');
  assert.equal(res.body.token, 'jwt-token');
  mock.restoreAll();
});

test('login rejects invalid credentials', async () => {
  mock.method(User, 'findOne', async () => ({
    _id: 'user_123',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'analyst',
    password: 'hashed-password',
  }));
  mock.method(bcrypt, 'compare', async () => false);

  const req: any = {
    body: {
      email: 'alice@example.com',
      password: 'wrong-password',
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

  await login(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'Invalid credentials');
  mock.restoreAll();
});
