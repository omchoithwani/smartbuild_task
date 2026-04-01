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
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseIntOrDefault(process.env.SMTP_PORT, 587),
  smtpSecure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  maxConcurrency: parseIntOrDefault(process.env.MAX_CONCURRENCY, 5),
  maxRetries: parseIntOrDefault(process.env.MAX_RETRIES, 5),
  requestTimeoutMs: parseIntOrDefault(process.env.REQUEST_TIMEOUT_MS, 15000),
  cronSchedule: process.env.CRON_SCHEDULE || '0 9 * * 1'
};

function validateConfig() {
  const missing = [];

  if (!config.privateAppToken && !config.hubspotApiKey) missing.push('PRIVATE_APP_TOKEN or HUBSPOT_API_KEY');
  if (!config.userId) missing.push('USER_ID');
  if (!config.emailTo) missing.push('EMAIL_TO');
  if (!config.emailFrom) missing.push('EMAIL_FROM');
  if (!config.smtpHost) missing.push('SMTP_HOST');
  if (!config.smtpUser) missing.push('SMTP_USER');
  if (!config.smtpPass) missing.push('SMTP_PASS');

  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { config, validateConfig };
