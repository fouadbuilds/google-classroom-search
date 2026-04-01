# classroom-search

A Chrome extension that brings VS Code-style command palette search to Google Classroom. Hit `Cmd+K` / `Ctrl+K` on any Classroom page and search across all your assignments, materials, and announcements instantly.

![palette](./icons/icon128.png)

## The problem

Google Classroom has no search. If you need to find an assignment from three weeks ago, you scroll. If you have eight classes, you scroll through eight streams. It's 2026 and there's no `Ctrl+F` for your coursework.

## The wall

The obvious fix is the Google Classroom API. Fetch everything, index it, search it. Except:

- The Google Cloud Console requires you to be 18+ to create a project and enable APIs
- School-issued Google Workspace accounts have admin restrictions that block third-party API access
- DOM scraping was a dead end — Classroom's UI is a React app with minified class names that change constantly

## The workaround

Google Classroom sends email notifications for every assignment, material, and announcement posted to your classes. Those emails go to your school Gmail. Gmail is accessible through Google Apps Script, which doesn't require a GCP project — it runs entirely within Google's ecosystem and is typically allowed even on school accounts.

**Version 1** parsed those notification emails to extract titles, course names, and links. It worked, but had a hard dependency on email history — delete your emails, lose your index.

**Version 2** (current) uses the Google Classroom API directly through Apps Script Services. In Apps Script you can add the Classroom API as a Service without touching the Cloud Console at all. No age wall, no admin restrictions, direct access to the actual data.

The result: 661 items across 8 courses, full titles, real links, rebuilt every 30 minutes automatically.

## Architecture

```
Chrome Extension (content script)
  │
  │  Cmd+K → open palette
  │  fetch on load if storage empty
  │
  ▼
chrome.storage.local
  │  gcs-index: ClassroomItem[]
  │  gcs-email: string
  │
  ▼ (every 30 mins via alarm → content script fetch)
Google Apps Script Web App
  │  doGet() → returns cached JSON
  │  rebuildCache() → runs on 30min trigger
  │
  ▼
Google Classroom API (via Apps Script Services)
  Classroom.Courses.list()
  Classroom.Courses.CourseWork.list()
  Classroom.Courses.CourseWorkMaterials.list()
  Classroom.Courses.Announcements.list()
```

**Why fetch in the content script and not the service worker?**

Chrome extension service workers can't bypass CORS on redirected responses. Apps Script URLs redirect through `script.googleusercontent.com` and the redirect strips CORS headers. Content scripts run in the page context of `classroom.google.com`, which doesn't have this restriction.

## Stack

- TypeScript + Vite
- Fuse.js (fuzzy search)
- Google Apps Script (backend + Classroom API bridge)
- Shadow DOM (palette isolation from Classroom's styles)
- `chrome.storage.local` (index cache)
- `chrome.alarms` (periodic refresh)

## Setup

### 1. Apps Script

1. Go to [script.google.com](https://script.google.com) and create a new project
2. Click **Services (+)** → add **Google Classroom API**
3. Paste the contents of `apps-script/classroom-search.gs`
4. Run `rebuildCache` once manually to warm the cache
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

| Shortcut | Action |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Open / close palette |
| `↑↓` | Navigate results |
| `↵` | Open item |
| `Esc` | Close palette |
| `> assignment` | Filter by type |
| `# course name` | Filter by course |

## Limitations

- Only indexes **active** courses — archived classes won't appear
- Announcement "titles" are the first 80 characters of the post text since the Classroom API has no title field for announcements
- Requires your school account to allow Google Apps Script execution

## What I learned

The most interesting problems weren't the code — they were the constraints. Being locked out of GCP forced a more creative solution that ended up being simpler and more appropriate for the use case. Apps Script with Classroom Services requires no infrastructure, no billing, no OAuth setup beyond what Google handles automatically. The "limitation" produced a better architecture than the obvious path would have.

CORS across service workers, Shadow DOM for style isolation, Chrome extension messaging patterns, and the difference between what an API exposes vs. what its UI shows — all came from building this in a single day.