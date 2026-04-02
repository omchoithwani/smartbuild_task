# Fixing GitHub PR Merge Conflicts

If GitHub says your PR has conflicts, update your feature branch with the latest `main` and resolve conflicts locally.

## 1) Update local refs

```bash
git fetch origin
```

## 2) Check out your PR branch

```bash
git checkout <your-pr-branch>
```

## 3) Rebase onto latest main (recommended)

```bash
git rebase origin/main
```

If you prefer merge instead of rebase:

```bash
git merge origin/main
```

## 4) Resolve conflicts

Open each conflicted file and remove conflict markers:

- `<<<<<<<`
- `=======`
- `>>>>>>>`

For this project, keep the **Resend + cron-job.org** version of `.env.example`:

```dotenv
EMAIL_FROM=
RESEND_API_KEY=
PORT=3000
DIGEST_TRIGGER_SECRET=
HUBSPOT_BASE_URL=https://api.hubapi.com
MAX_CONCURRENCY=5
MAX_RETRIES=5
REQUEST_TIMEOUT_MS=15000
```

Do **not** keep SMTP fields (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`) or `CRON_SCHEDULE` because scheduling is externalized to cron-job.org.

## 5) Mark resolved + continue

```bash
git add .env.example README.md src/config.js src/index.js src/services/emailService.js
git rebase --continue
```

(If you used merge instead of rebase, do `git commit`.)

## 6) Push updated branch

If rebasing, force-with-lease is expected:

```bash
git push --force-with-lease origin <your-pr-branch>
```

If merging:

```bash
git push origin <your-pr-branch>
```

## 7) Verify conflict-free state

```bash
rg "^<<<<<<<|^=======|^>>>>>>>" -n .
```

No output means conflict markers are gone.
