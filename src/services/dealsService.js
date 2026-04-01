class DealsService {
  constructor(hubspotClient) {
    this.hubspotClient = hubspotClient;
    this.dealCache = new Map();
  }

  async fetchDeal(dealId) {
    if (this.dealCache.has(dealId)) return this.dealCache.get(dealId);

    const response = await this.hubspotClient.get(`/crm/v3/objects/deals/${dealId}`, {
      properties: 'dealname,description,amount,proposal_submitted'
    });

    this.dealCache.set(dealId, response);
    return response;
  }
}

module.exports = { DealsService };
