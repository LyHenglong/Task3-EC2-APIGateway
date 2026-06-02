// JWT Helper - implements jwt.sign() and jwt.verify() using Node's built-in crypto
// Drop-in replacement for jsonwebtoken when the package is unavailable
const crypto = require('crypto');

function b64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function sign(payload, secret, options) {
  const expiresIn = options && options.expiresIn
    ? options.expiresIn
    : '24h';

  // Parse expiry
  let seconds = 86400; // default 24h
  const match = String(expiresIn).match(/^(\d+)(h|d|m|s)?$/);
  if (match) {
    const n = parseInt(match[1]);
    const unit = match[2] || 's';
    const mult = { s: 1, m: 60, h: 3600, d: 86400 };
    seconds = n * (mult[unit] || 1);
  }

  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = b64url(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + seconds
  }));
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return `${header}.${body}.${sig}`;
}

function verify(token, secret) {
  const [header, body, sig] = token.split('.');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  if (sig !== expected) throw new Error('Invalid signature');
  const payload = JSON.parse(Buffer.from(body, 'base64').toString());
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return payload;
}

module.exports = { sign, verify };
