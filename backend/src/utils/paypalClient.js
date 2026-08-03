const PAYPAL_BASE_URL =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry - 30_000) {
    return cachedToken;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw Object.assign(new Error('PayPal is not configured on this server.'), { status: 500 });
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const text = await response.text();
    throw Object.assign(new Error(`Failed to authenticate with PayPal: ${text}`), { status: 502 });
  }

  const data = await response.json();
  cachedToken = data.access_token;
  cachedTokenExpiry = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

async function paypalFetch(path, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(`${PAYPAL_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.details?.[0]?.description || 'PayPal request failed.';
    throw Object.assign(new Error(message), { status: response.status, details: data });
  }

  return data;
}

async function createOrder({ amount, currency = 'USD', referenceId }) {
  return paypalFetch('/v2/checkout/orders', {
    method: 'POST',
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: referenceId,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
    }),
  });
}

async function captureOrder(orderId) {
  return paypalFetch(`/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
  });
}

async function getOrder(orderId) {
  return paypalFetch(`/v2/checkout/orders/${orderId}`, { method: 'GET' });
}

module.exports = { createOrder, captureOrder, getOrder };
