const axios = require('axios');
const { config } = require('../config');

class EmailService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.resend.com',
      timeout: 15000,
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async sendDigestEmail(html) {
    await this.client.post('/emails', {
      from: config.emailFrom,
      to: [config.emailTo],
      subject: 'Weekly HubSpot Task Digest',
      html
    });
  }
}

module.exports = { EmailService };
