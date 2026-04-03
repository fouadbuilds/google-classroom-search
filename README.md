# Google Classroom-search

A Chrome extension that brings command palette search to Google Classroom. Hit `Cmd+K` / `Ctrl+K` on any Classroom page and instantly search across all your assignments, materials, and announcements.

# Just Tell Me What to do?

[here](https://github.com/fouadbuilds/google-classroom-search?tab=readme-ov-file#setup)

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

There are two parts: a small script that reads your Classroom data, and the extension itself. Both are free and take about 10 minutes.

### Part 1 — Apps Script (the data bridge)

This runs on Google's servers and reads your Classroom data. You only set this up once.

1. Go to [script.google.com](https://script.google.com) and sign in with the **same Google account you use for Classroom**
2. Click **New project** (top left)
3. You'll see a code editor. Delete everything in it
4. Open [`scripts/appscript.js`](./scripts/appscript.js) from this repo, copy all of it, and paste it into the editor
5. Click the **+** next to "Services" in the left sidebar → find **Google Classroom API** in the list → click **Add**
6. Click **Save** (the floppy disk icon or Ctrl+S)
7. At the top, make sure the dropdown says **rebuildCache** → click **Run**
   - A popup will ask for permissions — click "Review permissions", choose your account, then click "Allow"
   - Wait about 15 seconds — you'll see "Cache rebuilt — X items" in the log at the bottom
8. Click **Deploy → New deployment** (top right)
   - Click the gear icon next to "Type" and select **Web App**
   - Set **Execute as: Me**
   - Set **Who has access: Anyone**
   - Click **Deploy**
9. Copy the URL it gives you — it looks like `https://script.google.com/macros/s/ABC.../exec`

> ⚠️ Keep this URL private — anyone with it can read your Classroom index

### Part 2 — The Extension

**Option A — No coding (recommended for most people)**

1. Download this repo as a ZIP — click the green **Code** button → **Download ZIP** → unzip it
2. Open the unzipped folder, find `src/content/content-script.js` and open it in any text editor (Notepad on Windows, TextEdit on Mac)
3. Find this line near the top:
   ```
   const APPS_SCRIPT_URL = "your_deployment_url_here";
   ```
   Replace `your_deployment_url_here` with the URL you copied in Part 1 (keep the quotes)
4. Save the file
5. Open Chrome and go to `chrome://extensions`
6. Turn on **Developer mode** (toggle in the top right)
7. Click **Load unpacked** → select the `dist/` folder inside the unzipped folder
8. Go to [classroom.google.com](https://classroom.google.com) and press `Ctrl+K` (or `Cmd+K` on Mac)

**Option B — With Node.js (for developers)**

```bash
pnpm install
```

Set your Apps Script URL in `src/content/content-script.ts`:

```typescript
const APPS_SCRIPT_URL = "your_deployment_url_here"
```

```bash
pnpm build
```

Load `dist/` as an unpacked extension in `chrome://extensions`.

### Keeping your data fresh

Your Classroom data updates automatically every 30 minutes. If you just submitted something and want it to appear immediately, open the palette and click the **refresh** button in the bottom right corner.

## Usage

| Input               | Result                                 |
| ------------------- | -------------------------------------- |
| `Formula Sheet`       | Fuzzy search everything                |
| `>assignment`      | All assignments                        |
| `>assignment poetry` | Assignments matching "poetry"            |
| `#history`          | Everything in history           |
| `#biology cells`   | Biology items matching "cell" |

## Limitations

- Only indexes **active** courses — archived classes won't appear
- Announcement "titles" are the first 80 characters of post text — the Classroom API has no title field for announcements

## Thoughts

The most interesting problems weren't the code — they were the constraints. Being locked out of GCP forced a more creative solution that ended up being simpler and more appropriate for the use case. Apps Script with Classroom Services requires no infrastructure, no billing, no OAuth setup beyond what Google handles automatically.

## Feedback

Please give Feedback. Check my profile readme to email me