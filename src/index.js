const express = require('express');
const { config, validateConfig } = require('./config');
const { logger } = require('./utils/logger');
const { HubSpotClient } = require('./services/hubspotClient');
const { TasksService } = require('./services/tasksService');
const { DealsService } = require('./services/dealsService');
const { NotesService } = require('./services/notesService');
const { EmailService } = require('./services/emailService');
const { DigestService } = require('./services/digestService');

async function buildAndRunDigest() {
  const hubspotClient = new HubSpotClient();
  const tasksService = new TasksService(hubspotClient);
  const dealsService = new DealsService(hubspotClient);
  const notesService = new NotesService(hubspotClient);
  const emailService = new EmailService();

  const digestService = new DigestService({
    tasksService,
    dealsService,
    notesService,
    emailService
  });

  await digestService.runWeeklyDigest(new Date());
}

function isAuthorizedTrigger(req) {
  const provided = req.get('x-digest-secret') || req.query.secret;
  return provided && provided === config.digestTriggerSecret;
}

async function start() {
  try {
    validateConfig();

    if (process.argv.includes('--run-once')) {
      await buildAndRunDigest();
      return;
    }

    const app = express();
    app.use(express.json());

    app.get('/health', (_req, res) => {
      res.status(200).json({ ok: true });
    });

    app.get('/jobs/weekly-digest', (_req, res) => {
      res.status(405).json({
        error: 'Method Not Allowed',
        message: 'Use POST /jobs/weekly-digest with ?secret=... or x-digest-secret header.'
      });
    });

    app.post('/jobs/weekly-digest', async (req, res) => {
      if (!isAuthorizedTrigger(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
        await buildAndRunDigest();
        return res.status(200).json({ status: 'Digest sent' });
      } catch (error) {
        logger.error('Digest trigger failed', { message: error.message });
        return res.status(500).json({ error: 'Digest failed' });
      }
    });

    app.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port}`);
      logger.info('Configure cron-job.org to call POST /jobs/weekly-digest weekly at your chosen day/time.');
    });
  } catch (error) {
    logger.error('Failed to start service', { message: error.message });
    process.exit(1);
  }
}

start();
