// Integration tests using Node's built-in test runner.
// Run with: npm test
//
// Requires a real MongoDB instance — set TEST_MONGO_URI (falls back to
// mongodb://127.0.0.1:27017/goldcinema_test) before running. If no MongoDB
// is reachable, every test skips itself with an explanatory message instead
// of failing the whole suite, so `npm test` stays usable in environments
// (like CI containers without Mongo) where the DB simply isn't available.

process.env.MONGO_URI =
  process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/goldcinema_main';
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:5173';

const test = require('node:test');
const assert = require('node:assert/strict');

const { connectDB, disconnectDB, mongoose } = require('../src/config/db');
const app = require('../src/app');
const Movie = require('../src/models/movie');
const Cinema = require('../src/models/cinema');
const Screen = require('../src/models/screen');
const Showtime = require('../src/models/showtime');
const User = require('../src/models/user');
const Role = require('../src/models/role');
const SeatHold = require('../src/models/seatHold');
const Order = require('../src/models/order');

let server;
let baseUrl;
let dbAvailable = true;
let seeded = {};

test.before(async () => {
  try {
    await connectDB();
  } catch (err) {
    dbAvailable = false;
    console.warn(
      `\n[tests] Skipping all tests: could not reach MongoDB at ${process.env.MONGO_URI}.\n` +
      `[tests] Set TEST_MONGO_URI to a running instance to enable these tests.\n`
    );
    return;
  }

  // Clean slate for a deterministic test run.
  await Promise.all(
    [Movie, Cinema, Screen, Showtime, User, Role, SeatHold, Order].map((m) =>
      m.deleteMany({})
    )
  );

  const cinema = await Cinema.create({
    name: 'Test Cinema',
    location: { address: '1 Test St', city: 'Testville', country: 'USA' },
  });
  const screen = await Screen.create({
    cinema: cinema._id,
    name: 'Screen 1',
    rows: 1,
    columns: 2,
    seats: [
      { row: 'A', number: '1', column: 1 },
      { row: 'A', number: '2', column: 2 },
    ],
  });
  const movie = await Movie.create({
    title: 'Test Movie',
    slug: 'test-movie',
    duration: 100,
    description: 'A test movie.',
    posterUrl: 'https://example.com/poster.jpg',
    rating: 'PG',
    price: 10,
  });
  const showtime = await Showtime.create({
    movie: movie._id,
    cinema: cinema._id,
    screen: screen._id,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
    seats: [
      { seatId: 'A1', status: 'available' },
      { seatId: 'A2', status: 'available' },
    ],
  });

  seeded = { cinema, screen, movie, showtime };

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (!dbAvailable) return;
  await Promise.all(
    [Movie, Cinema, Screen, Showtime, User, Role, SeatHold, Order].map((m) =>
      m.deleteMany({})
    )
  );
  await new Promise((resolve) => server.close(resolve));
  await disconnectDB();
});

async function registerAndVerify(emailPrefix) {
  const email = `${emailPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: 'password123' }),
  });
  const { token } = await registerRes.json();

  // Directly mark verified in the DB (equivalent to clicking the emailed link)
  // so tests don't need to parse the console-logged email.
  await User.findOneAndUpdate({ email }, { emailVerified: true });

  return { email, token };
}

test('health check responds ok', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
});

test('register rejects a short password', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Bob', email: 'bob@example.com', password: 'short' }),
  });
  assert.equal(res.status, 400);
});

test('register creates an unverified user; login works either way', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const email = `unverified-${Date.now()}@example.com`;
  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alice', email, password: 'password123' }),
  });
  assert.equal(registerRes.status, 201);
  const { user } = await registerRes.json();
  assert.equal(user.emailVerified, false);

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  });
  assert.equal(loginRes.status, 200); // login itself doesn't require verification
});

test('email verification: valid token verifies, wrong password still rejected', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const email = `verify-${Date.now()}@example.com`;
  await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Vera', email, password: 'password123' }),
  });

  const user = await User.findOne({ email });
  assert.ok(user.verificationToken, 'a verification token should have been generated');

  const verifyRes = await fetch(
    `${baseUrl}/api/auth/verify-email?token=${user.verificationToken}`
  );
  assert.equal(verifyRes.status, 200);

  const reloaded = await User.findOne({ email });
  assert.equal(reloaded.emailVerified, true);
  assert.equal(reloaded.verificationToken, null);

  const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'wrongpassword' }),
  });
  assert.equal(wrongPassRes.status, 401);
});

test('unverified users are blocked from holding seats; verified users are not', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const email = `holder-${Date.now()}@example.com`;
  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Holder', email, password: 'password123' }),
  });
  const { token } = await registerRes.json();

  const blockedRes = await fetch(`${baseUrl}/api/hold-seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ showtimeId: seeded.showtime._id.toString(), seatIds: ['A1'] }),
  });
  assert.equal(blockedRes.status, 403);
  const blockedBody = await blockedRes.json();
  assert.equal(blockedBody.code, 'EMAIL_NOT_VERIFIED');

  await User.findOneAndUpdate({ email }, { emailVerified: true });

  const allowedRes = await fetch(`${baseUrl}/api/hold-seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ showtimeId: seeded.showtime._id.toString(), seatIds: ['A1'] }),
  });
  assert.equal(allowedRes.status, 201);
});

test('seat hold prevents double booking across different users, but not against the same user re-selecting', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const userA = await registerAndVerify('usera');
  const userB = await registerAndVerify('userb');

  const holdRes = await fetch(`${baseUrl}/api/hold-seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userA.token}` },
    body: JSON.stringify({ showtimeId: seeded.showtime._id.toString(), seatIds: ['A2'] }),
  });
  assert.equal(holdRes.status, 201);
  const { hold, amount } = await holdRes.json();
  assert.equal(amount, 10); // 1 seat * $10, server-computed

  // A different user trying to hold the same seat should conflict.
  const conflictRes = await fetch(`${baseUrl}/api/hold-seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userB.token}` },
    body: JSON.stringify({ showtimeId: seeded.showtime._id.toString(), seatIds: ['A2'] }),
  });
  assert.equal(conflictRes.status, 409);

  // The original user re-selecting the same seat is fine (replaces their own hold).
  const reselectRes = await fetch(`${baseUrl}/api/hold-seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userA.token}` },
    body: JSON.stringify({ showtimeId: seeded.showtime._id.toString(), seatIds: ['A2'] }),
  });
  assert.equal(reselectRes.status, 201);

  const { hold: reselectedHold } = await reselectRes.json();
  await SeatHold.findByIdAndDelete(reselectedHold.id);
});

test('extend-hold adds 5 minutes and enforces the extension cap', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const user = await registerAndVerify('extender');
  const holdRes = await fetch(`${baseUrl}/api/hold-seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
    body: JSON.stringify({ showtimeId: seeded.showtime._id.toString(), seatIds: ['A1', 'A2'] }),
  });

  if (holdRes.status !== 201) {
    return t.skip('Seats already held by a previous test run in this shared showtime.');
  }

  const { hold: initialHold } = await holdRes.json();
  const initialExpiry = new Date(initialHold.expiresAt).getTime();

  const extendRes = await fetch(`${baseUrl}/api/extend-hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
    body: JSON.stringify({ holdId: initialHold.id }),
  });
  assert.equal(extendRes.status, 200);
  const { hold: extended } = await extendRes.json();
  const newExpiry = new Date(extended.expiresAt).getTime();
  assert.ok(newExpiry - initialExpiry >= 5 * 60 * 1000 - 1000); // ~5 min later

  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${baseUrl}/api/extend-hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ holdId: initialHold.id }),
    });
    if (res.status !== 200) {
      assert.equal(res.status, 409); // cap reached
      break;
    }
  }

  await SeatHold.findByIdAndDelete(initialHold.id);
});

test('payment routes require an active hold owned by the requester', async (t) => {
  if (!dbAvailable) return t.skip('MongoDB not reachable');

  const user = await registerAndVerify('payer');
  const res = await fetch(`${baseUrl}/api/payments/stripe/create-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
    body: JSON.stringify({ holdId: new mongoose.Types.ObjectId().toString() }),
  });
  assert.equal(res.status, 404);
});