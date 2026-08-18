process.env.MONGO_URI =
  process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/goldcinema_main';
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:3000';

const test = require('node:test');
const assert = require('node:assert/strict');

const { connectDB, disconnectDB, mongoose } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/user');
const Notification = require('../src/models/notification');
const { createNotification } = require('../src/utils/notifications');

let server;
let baseUrl;
let dbAvailable = true;

test.before(async () => {
  try {
    await connectDB();
  } catch (err) {
    dbAvailable = false;
    console.warn(`[notifications.test] MongoDB not reachable: ${err.message}`);
    return;
  }

  await Notification.deleteMany({});
  await User.deleteMany({});

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  if (server) server.close();
  if (dbAvailable) await disconnectDB();
});

async function createTestUser(prefix = 'notifuser') {
  const email = `${prefix}_${Date.now()}@example.com`;
  const user = await User.create({
    name: 'Notification Tester',
    email,
    passwordHash: '$2a$10$abcdefghijklmnopqrstuuu',
    emailVerified: true,
  });

  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return { user, token };
}

test('Notification Service creates notifications safely', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const { user } = await createTestUser('service_test');
  const notif = await createNotification({
    userId: user._id,
    title: 'Test Service Alert',
    message: 'Testing creation logic',
    type: 'system',
    link: '/account',
  });

  assert.ok(notif._id);
  assert.equal(notif.title, 'Test Service Alert');
  assert.equal(notif.read, false);
  assert.equal(notif.archived, false);
});

test('GET /api/notifications returns user notifications and unread count', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const { user, token } = await createTestUser('get_test');

  await createNotification({
    userId: user._id,
    title: 'Unread Alert 1',
    message: 'First unread',
    type: 'login',
  });

  await createNotification({
    userId: user._id,
    title: 'Unread Alert 2',
    message: 'Second unread',
    type: 'purchase',
  });

  const res = await fetch(`${baseUrl}/api/notifications?filter=all`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.notifications.length, 2);
  assert.equal(data.unreadCount, 2);
});

test('PATCH /api/notifications/:id/read toggles read status', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const { user, token } = await createTestUser('read_test');
  const notif = await createNotification({
    userId: user._id,
    title: 'Read Toggle Alert',
    message: 'Will be marked as read',
    type: 'system',
  });

  const readRes = await fetch(`${baseUrl}/api/notifications/${notif._id}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ read: true }),
  });

  assert.equal(readRes.status, 200);
  const readData = await readRes.json();
  assert.equal(readData.notification.read, true);
  assert.equal(readData.unreadCount, 0);
});

test('PATCH /api/notifications/:id/archive toggles archive status', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const { user, token } = await createTestUser('archive_test');
  const notif = await createNotification({
    userId: user._id,
    title: 'Archive Toggle Alert',
    message: 'Will be archived',
    type: 'promo',
  });

  const archRes = await fetch(`${baseUrl}/api/notifications/${notif._id}/archive`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ archived: true }),
  });

  assert.equal(archRes.status, 200);
  const archData = await archRes.json();
  assert.equal(archData.notification.archived, true);
});

test('POST /api/notifications/test generates a test notification', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const { token } = await createTestUser('post_test');

  const testRes = await fetch(`${baseUrl}/api/notifications/test`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(testRes.status, 201);
  const testData = await testRes.json();
  assert.ok(testData.notification._id);
  assert.ok(testData.notification.title);
});
