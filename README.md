# HubSpot Weekly Task Digest Service

Production-ready Node.js service that fetches pending HubSpot tasks for one owner, enriches each with associated deal and note context, and sends a weekly digest email using **Resend**.

## What changed

- Scheduling now uses **cron-job.org** (external scheduler) instead of in-process `node-cron`.
- The app exposes a secure webhook endpoint (`POST /jobs/weekly-digest`) for cron-job.org to call.
- Email delivery is now done via **Resend API**.
- The user chooses weekly send day/time directly inside cron-job.org.

## Features

- Fetches tasks with HubSpot Search API (`/crm/v3/objects/tasks/search`) using owner, status, and week range filters.
- Handles pagination (`limit: 100`) via `paging.next.after`.
- Resolves task→deal associations and skips tasks with no associated deals.
- Fetches deal details and best-matching note (prefer latest containing `Ed’s Note`, fallback to latest note, fallback to `No notes available`).
- Groups tasks by deal.
- Generates HTML email with per-task dividers (`<hr>`) and no divider after the last task.
- Uses concurrency limiting (`p-limit`), caching for deals/notes, and retry with exponential backoff for `429` and `5xx` errors.
- Supports one-off execution mode for testing (`npm run run-once`).

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

Copy `.env.example` to `.env` and set:

- `PRIVATE_APP_TOKEN` **or** `HUBSPOT_API_KEY`
- `USER_ID`
- `EMAIL_TO`
- `EMAIL_FROM` (must be a verified sender/domain in Resend)
- `RESEND_API_KEY`
- `DIGEST_TRIGGER_SECRET` (shared secret checked by webhook)
- `PORT` (optional, default `3000`)
- Optional: `HUBSPOT_BASE_URL`, `MAX_CONCURRENCY`, `MAX_RETRIES`, `REQUEST_TIMEOUT_MS`

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`.
3. Test once immediately:
   ```bash
   npm run run-once
   ```
4. Start server:
   ```bash
   npm start
   ```

## cron-job.org setup (user chooses weekly time)

1. Deploy this service (locally tunneled or hosted) so cron-job.org can reach it.
2. In cron-job.org, create a new cronjob:
   - **Method**: `POST`
   - **URL**: `https://YOUR_HOST/jobs/weekly-digest?secret=YOUR_DIGEST_TRIGGER_SECRET`
   - **Schedule**: choose **weekly**, then select your desired day/time/timezone.
3. Save and enable the job.

> This is how the user picks their weekly delivery schedule.

## Deploy on Render

1. Push repository to GitHub.
2. In Render, create a **Web Service**.
3. Configure:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add all `.env.example` vars in Render environment settings.
5. Deploy and copy Render URL.
6. Point cron-job.org webhook URL to: `https://<render-service-url>/jobs/weekly-digest?secret=<DIGEST_TRIGGER_SECRET>`.

## API endpoints

- `GET /health` → health check.
- `GET /jobs/weekly-digest` → returns `405` with guidance to use POST.
- `POST /jobs/weekly-digest` → triggers digest send (requires secret via query `secret` or header `x-digest-secret`).
