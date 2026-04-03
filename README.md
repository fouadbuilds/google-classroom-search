# Google Classroom-search

A Chrome extension that brings command palette search to Google Classroom. Hit `Cmd+K` / `Ctrl+K` on any Classroom page and instantly search across all your assignments, materials, and announcements.

## The problem

Google Classroom has no search. Finding an assignment from three weeks ago means scrolling through the entire class stream. Hours Wasted when studying

## The wall

The obvious fix is the Google Classroom API. Fetch everything, index it, search it. Except:

- Google Cloud Console requires you to be 18+ to create a project
- School-issued Google Workspace accounts have admin restrictions blocking third-party API access
- DOM scraping was a dead end — Classroom's UI is a minified app with class names that change constantly

## The workaround

**Version 1** — Google Classroom sends email notifications for every post. Those land in school Gmail, which is accessible through Google Apps Script without needing a GCP project. The script parsed those notification emails to extract titles, course names, and links. It worked, but had a hard dependency on email history — delete your emails, lose your index.

**Version 2 (current)** — Apps Script lets you add the Google Classroom API directly as a Service, no Cloud Console required. No age wall, no admin restrictions, direct access to live data. 661 items across 8 courses, full titles, real deep links, rebuilt every 30 minutes automatically.

## Architecture

```
Chrome Extension (content script)
  │
  │  Cmd+K / Ctrl+K → open palette
  │  fetch on page load if storage empty
  │
  ▼
chrome.storage.local
  │  gcs-index: ClassroomItem[]
  │  gcs-last-updated: timestamp
  │
  ▼ (30 min alarm → content script fetch)
Google Apps Script Web App
  │  doGet()       → returns cached JSON instantly
  │  rebuildCache() → runs on 30 min trigger, hits API fresh
  │
  ▼
Google Classroom API (via Apps Script Services)
  Classroom.Courses.list()
  Classroom.Courses.CourseWork.list()
  Classroom.Courses.CourseWorkMaterials.list()
  Classroom.Courses.Announcements.list()
```

**Why fetch in the content script and not the service worker?**

Chrome extension service workers can't bypass CORS on redirected responses. Apps Script URLs redirect through `script.googleusercontent.com` which strips CORS headers. Content scripts run in the page context of `classroom.google.com` and don't have this restriction.

**Why `authuser` from the URL and not stored email?**

Classroom's URL always contains `/u/0/`, `/u/1/` etc. reflecting the active account. Reading it live means the correct account is always used regardless of which Google account is active — no storage, no permissions, no backend changes needed.

## Stack

- TypeScript + Vite
- Fuse.js — fuzzy search
- Google Apps Script — backend + Classroom API bridge
- Shadow DOM — palette style isolation from Classroom's CSS
- `chrome.storage.local` — index cache
- `chrome.alarms` — periodic background refresh

## Features

- Fuzzy search across all assignments, materials, and announcements
- Prefix commands:
  - `> assignment` — filter by type
  - `# global` — filter by course
  - `# global berlin` — filter by course then search within
- Keyboard navigation — `↑↓` to move, `↵` to open, `Esc` to close
- Refresh button in palette footer
- Account-aware links — always opens in your active Google account
- Install toast — shows shortcut hint once on first install

## Setup

### 1. Apps Script

1. Go to [script.google.com](https://script.google.com) and create a new project
2. Click **Services (+)** → add **Google Classroom API**
3. Paste the contents of `scripts/appscript.js`
4. Run `rebuildCache` manually once to warm the cache
5. **Deploy → New deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the deployment URL

### 2. Extension

```bash
pnpm install
```

Set your Apps Script URL in `src/content/content-script.ts`:

```typescript
const APPS_SCRIPT_URL = "your_deployment_url_here";
```

```bash
pnpm build
```

Load `dist/` as an unpacked extension in `chrome://extensions`.

## Usage

| Input | Result |
|-------|--------|
| `berlin wall` | Fuzzy search everything |
| `> assignment` | All assignments |
| `> assignment cuba` | Assignments matching "cuba" |
| `# global` | Everything in Global History |
| `# global berlin` | Global History items matching "berlin" |

## Limitations

- Only indexes **active** courses — archived classes won't appear
- Announcement "titles" are the first 80 characters of post text — the Classroom API has no title field for announcements


## Thoughts

The most interesting problems weren't the code — they were the constraints. Being locked out of GCP forced a more creative solution that ended up being simpler and more appropriate for the use case. Apps Script with Classroom Services requires no infrastructure, no billing, no OAuth setup beyond what Google handles automatically.

## Feedback
Please give Feedback. Check my profile readme to email me
