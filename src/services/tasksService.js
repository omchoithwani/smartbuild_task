const { config } = require('../config');

class TasksService {
  constructor(hubspotClient) {
    this.hubspotClient = hubspotClient;
  }

  async fetchPendingTasksForWeek({ start, end }) {
    const tasks = [];
    let after;

    do {
      const body = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'hubspot_owner_id',
                operator: 'EQ',
                value: config.userId
              },
              {
                propertyName: 'hs_task_status',
                operator: 'NEQ',
                value: 'COMPLETED'
              },
              {
                propertyName: 'hs_timestamp',
                operator: 'BETWEEN',
                value: start.getTime(),
                highValue: end.getTime()
              }
            ]
          }
        ],
        properties: ['hs_task_subject', 'hs_timestamp'],
        sorts: [{ propertyName: 'hs_timestamp', direction: 'ASCENDING' }],
        limit: 100
      };

      if (after) body.after = after;

      const response = await this.hubspotClient.post('/crm/v3/objects/tasks/search', body);
      tasks.push(...(response.results || []));
      after = response.paging?.next?.after;
    } while (after);

    return tasks;
  }

  async fetchAssociatedDealIds(taskId) {
    const response = await this.hubspotClient.get(`/crm/v4/objects/tasks/${taskId}/associations/deals`);
    return (response.results || []).map((item) => item.toObjectId || item.id).filter(Boolean);
  }
}

module.exports = { TasksService };
