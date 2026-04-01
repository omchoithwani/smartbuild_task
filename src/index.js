const cron = require('node-cron');
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

async function start() {
  try {
    validateConfig();

    if (process.argv.includes('--run-once')) {
      await buildAndRunDigest();
      return;
    }

    logger.info(`Scheduling weekly digest with cron: ${config.cronSchedule}`);
    cron.schedule(config.cronSchedule, async () => {
      try {
        await buildAndRunDigest();
      } catch (error) {
        logger.error('Scheduled digest failed', { message: error.message });
      }
    });
  } catch (error) {
    logger.error('Failed to start service', { message: error.message });
    process.exit(1);
  }
}

start();
