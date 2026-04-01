const pLimit = require('p-limit');
const { config } = require('../config');
const { getWeekRange } = require('../utils/date');
const { logger } = require('../utils/logger');
const { escapeHtml } = require('../utils/html');

class DigestService {
  constructor({ tasksService, dealsService, notesService, emailService }) {
    this.tasksService = tasksService;
    this.dealsService = dealsService;
    this.notesService = notesService;
    this.emailService = emailService;
    this.limit = pLimit(config.maxConcurrency);
  }

  async runWeeklyDigest(referenceDate = new Date()) {
    const { start, end } = getWeekRange(referenceDate);
    logger.info('Running weekly digest', { start: start.toISOString(), end: end.toISOString() });

    const tasks = await this.tasksService.fetchPendingTasksForWeek({ start, end });
    logger.info(`Fetched ${tasks.length} pending tasks`);

    const grouped = {};

    await Promise.all(
      tasks.map((task) =>
        this.limit(async () => {
          const taskId = task.id;
          const taskName = task.properties?.hs_task_subject || 'Untitled task';
          const dealIds = await this.tasksService.fetchAssociatedDealIds(taskId);

          if (!dealIds.length) {
            return;
          }

          await Promise.all(
            dealIds.map((dealId) =>
              this.limit(async () => {
                const [deal, note] = await Promise.all([
                  this.dealsService.fetchDeal(dealId),
                  this.notesService.fetchBestDealNote(dealId)
                ]);

                if (!grouped[dealId]) {
                  const props = deal.properties || {};
                  grouped[dealId] = {
                    dealId,
                    dealName: props.dealname || 'Unnamed deal',
                    description: props.description || 'No description',
                    amount: props.amount || 'N/A',
                    proposalSubmitted: props.proposal_submitted || 'N/A',
                    tasks: []
                  };
                }

                grouped[dealId].tasks.push({ taskName, note });
              })
            )
          );
        })
      )
    );

    const html = this.generateDigestHtml(grouped, start, end);
    await this.emailService.sendDigestEmail(html);

    logger.info('Weekly digest email sent', {
      dealsCount: Object.keys(grouped).length,
      tasksCount: tasks.length
    });
  }

  generateDigestHtml(groupedDeals, start, end) {
    const deals = Object.values(groupedDeals);

    if (!deals.length) {
      return `
        <h2>Weekly HubSpot Task Digest</h2>
        <p>No pending tasks with associated deals were found for ${start.toDateString()} - ${end.toDateString()}.</p>
      `;
    }

    const dealSections = deals
      .map((deal) => {
        const tasksHtml = deal.tasks
          .map((task, index) => {
            const divider = index < deal.tasks.length - 1 ? '<hr />' : '';
            return `
              <div>
                <p><strong>Task:</strong> ${escapeHtml(task.taskName)}</p>
                <p><strong>Note:</strong> ${escapeHtml(task.note)}</p>
              </div>
              ${divider}
            `;
          })
          .join('');

        return `
          <section style="margin-bottom: 24px;">
            <h3>${escapeHtml(deal.dealName)}</h3>
            <p><strong>Description:</strong> ${escapeHtml(deal.description)}</p>
            <p><strong>Amount:</strong> ${escapeHtml(deal.amount)}</p>
            <p><strong>Proposal Submitted:</strong> ${escapeHtml(deal.proposalSubmitted)}</p>
            <div>${tasksHtml}</div>
          </section>
        `;
      })
      .join('');

    return `
      <h2>Weekly HubSpot Task Digest</h2>
      <p>Week: ${start.toDateString()} - ${end.toDateString()}</p>
      ${dealSections}
    `;
  }
}

module.exports = { DigestService };
