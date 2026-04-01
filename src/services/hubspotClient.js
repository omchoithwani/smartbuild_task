const axios = require('axios');
const { config } = require('../config');
const { logger } = require('../utils/logger');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class HubSpotClient {
  constructor() {
    const headers = {};

    if (config.privateAppToken) {
      headers.Authorization = `Bearer ${config.privateAppToken}`;
    }

    this.client = axios.create({
      baseURL: config.hubspotBaseUrl,
      timeout: config.requestTimeoutMs,
      headers
    });
  }

  async request({ method, url, params, data }, attempt = 0) {
    const finalParams = { ...(params || {}) };
    if (!config.privateAppToken && config.hubspotApiKey) {
      finalParams.hapik = config.hubspotApiKey;
    }

    try {
      const response = await this.client.request({ method, url, params: finalParams, data });
      return response.data;
    } catch (error) {
      const statusCode = error.response?.status;
      const shouldRetry = statusCode === 429 || (statusCode >= 500 && statusCode < 600);

      if (shouldRetry && attempt < config.maxRetries) {
        const retryAfter = Number(error.response?.headers?.['retry-after']);
        const backoffMs = Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : Math.min(1000 * 2 ** attempt, 30000);

        logger.warn('HubSpot request failed, retrying', {
          url,
          statusCode,
          attempt: attempt + 1,
          waitMs: backoffMs
        });

        await sleep(backoffMs);
        return this.request({ method, url, params, data }, attempt + 1);
      }

      logger.error('HubSpot request failed permanently', {
        url,
        statusCode,
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  post(url, data) {
    return this.request({ method: 'POST', url, data });
  }

  get(url, params) {
    return this.request({ method: 'GET', url, params });
  }
}

module.exports = { HubSpotClient };
