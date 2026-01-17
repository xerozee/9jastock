/**
 * Apple Sign-In Secret Generator
 *
 * Apple requires a dynamically generated JWT as the client secret.
 * This script generates the secret which is valid for 6 months.
 *
 * Run: node scripts/generate-apple-secret.js
 *
 * Then add the output to your .env.local as APPLE_SECRET
 */

const jwt = require('jsonwebtoken');

const teamId = process.env.APPLE_TEAM_ID || '96ZKC79A45';
const clientId = process.env.APPLE_ID || 'com.9jastocks.9jastock.web';
const keyId = process.env.APPLE_KEY_ID || '7A8H897VWS';

// Your private key from Apple (the .p8 file contents)
const privateKey = process.env.APPLE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgrHtlw+jt86DaJuM0
WVTDsHBiPPjm6s76ThTX+qdJ7KigCgYIKoZIzj0DAQehRANCAASoNUf0k1nLcFBz
Fookmk1I/LCMI1XDI9bo2j1ghdDaZerIhcAXMjejzU676FAGZElNcCU6GRU+Ye10
+I0V5tNe
-----END PRIVATE KEY-----`;

const now = Math.floor(Date.now() / 1000);
const expiration = now + (86400 * 180); // 180 days (6 months)

const payload = {
  iss: teamId,
  iat: now,
  exp: expiration,
  aud: 'https://appleid.apple.com',
  sub: clientId,
};

const secret = jwt.sign(payload, privateKey, {
  algorithm: 'ES256',
  header: {
    alg: 'ES256',
    kid: keyId,
  },
});

console.log('\n=== Apple Client Secret ===\n');
console.log(secret);
console.log('\n=== Add this to your .env.local as APPLE_SECRET ===\n');
console.log(`APPLE_SECRET=${secret}`);
console.log('\nThis secret expires in 180 days. Remember to regenerate before expiration.\n');
