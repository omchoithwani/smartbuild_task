class NotesService {
  constructor(hubspotClient) {
    this.hubspotClient = hubspotClient;
    this.bestNoteByDeal = new Map();
  }

  async fetchBestDealNote(dealId) {
    if (this.bestNoteByDeal.has(dealId)) return this.bestNoteByDeal.get(dealId);

    const assocResponse = await this.hubspotClient.get(`/crm/v4/objects/deals/${dealId}/associations/notes`);
    const noteIds = (assocResponse.results || []).map((item) => item.toObjectId || item.id).filter(Boolean);

    if (!noteIds.length) {
      this.bestNoteByDeal.set(dealId, 'No notes available');
      return 'No notes available';
    }

    const noteDetails = await Promise.all(
      noteIds.map((noteId) =>
        this.hubspotClient.get(`/crm/v3/objects/notes/${noteId}`, {
          properties: 'hs_note_body,hs_timestamp,createdate'
        })
      )
    );

    const notes = noteDetails
      .map((note) => {
        const props = note.properties || {};
        return {
          body: props.hs_note_body || '',
          timestamp: new Date(props.hs_timestamp || props.createdate || 0).getTime()
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    const preferred = notes.find((n) => n.body.includes('Ed’s Note')) || notes[0];
    const selected = preferred?.body ? preferred.body : 'No notes available';

    this.bestNoteByDeal.set(dealId, selected);
    return selected;
  }
}

module.exports = { NotesService };
