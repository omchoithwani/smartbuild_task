# HubSpot Weekly Task Digest Service

Production-ready Node.js service that fetches pending HubSpot tasks for one owner, enriches each with associated deal and note context, and sends a weekly digest email.

## Features

- Fetches tasks with HubSpot Search API (`/crm/v3/objects/tasks/search`) using owner, status, and week range filters.
- Handles pagination (`limit: 100`) via `paging.next.after`.
- Resolves task→deal associations and skips tasks with no associated deals.
- Fetches deal details and best-matching note (prefer latest containing `Ed’s Note`, fallback to latest note, fallback to `No notes available`).
- Groups tasks by deal.
- Generates HTML email with per-task dividers (`<hr>`) and no divider after the last task.
- Uses concurrency limiting (`p-limit`), caching for deals/notes, and retry with exponential backoff for `429` and `5xx` errors.
- Runs automatically every Monday at 9 AM using `node-cron`.

## Project structure

```txt
src/
  index.js
  config.js
  services/
    hubspotClient.js
    tasksService.js
    dealsService.js
    notesService.js
    digestService.js
    emailService.js
  utils/
    date.js
    html.js
    logger.js
```

## Environment variables

Copy `.env.example` to `.env` and set values:

- `PRIVATE_APP_TOKEN` **or** `HUBSPOT_API_KEY`
- `USER_ID`
- `EMAIL_TO`
- `EMAIL_FROM`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- Optional: `HUBSPOT_BASE_URL`, `MAX_CONCURRENCY`, `MAX_RETRIES`, `REQUEST_TIMEOUT_MS`, `CRON_SCHEDULE`

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`.
3. Run once now:
   ```bash
   npm run run-once
   ```
4. Run scheduler service:
   ```bash
   npm start
   ```

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, create a **Web Service** from the repo.
3. Configure:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add all environment variables from `.env.example` in Render dashboard.
5. Deploy.

### Notes for Render

- Keep the service running continuously so `node-cron` can trigger at Monday 9 AM.
- Optionally set timezone at platform level if you need non-UTC scheduling.
