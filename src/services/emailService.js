const nodemailer = require('nodemailer');
const { config } = require('../config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      }
    });
  }

  async sendDigestEmail(html) {
    await this.transporter.sendMail({
      from: config.emailFrom,
      to: config.emailTo,
      subject: 'Weekly HubSpot Task Digest',
      html
    });
  }
}

module.exports = { EmailService };
