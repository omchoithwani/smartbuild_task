const dotenv = require('dotenv');

dotenv.config();

function parseIntOrDefault(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const config = {
  hubspotBaseUrl: process.env.HUBSPOT_BASE_URL || 'https://api.hubapi.com',
  privateAppToken: process.env.PRIVATE_APP_TOKEN,
  hubspotApiKey: process.env.HUBSPOT_API_KEY,
  userId: process.env.USER_ID,
  emailTo: process.env.EMAIL_TO,
  emailFrom: process.env.EMAIL_FROM,
  resendApiKey: process.env.RESEND_API_KEY,
  port: parseIntOrDefault(process.env.PORT, 3000),
  digestTriggerSecret: process.env.DIGEST_TRIGGER_SECRET,
  maxConcurrency: parseIntOrDefault(process.env.MAX_CONCURRENCY, 5),
  maxRetries: parseIntOrDefault(process.env.MAX_RETRIES, 5),
  requestTimeoutMs: parseIntOrDefault(process.env.REQUEST_TIMEOUT_MS, 15000)
};

function validateConfig() {
  const missing = [];

  if (!config.privateAppToken && !config.hubspotApiKey) missing.push('PRIVATE_APP_TOKEN or HUBSPOT_API_KEY');
  if (!config.userId) missing.push('USER_ID');
  if (!config.emailTo) missing.push('EMAIL_TO');
  if (!config.emailFrom) missing.push('EMAIL_FROM');
  if (!config.resendApiKey) missing.push('RESEND_API_KEY');
  if (!config.digestTriggerSecret) missing.push('DIGEST_TRIGGER_SECRET');

  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { config, validateConfig };
