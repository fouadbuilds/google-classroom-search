import Fuse from "fuse.js";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbylS5uf1wNaFOIqMll0In2ulVvv4w5aSUnwGfz-vHc1pUZFNfo7JejqyhUVlXVFsqC4tQ/exec";

export interface ClassroomItem {
  title: string;
  course: string;
  type: "Assignment" | "Material" | "Announcement" | "Class";
  link: string;
}

let paletteRoot: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let fuseInstance: Fuse<ClassroomItem> | null = null;
let activeIdx = 0;
let current: ClassroomItem[] = [];

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchAndStoreIndex(): Promise<void> {
  try {
    const response = await fetch(APPS_SCRIPT_URL, { redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();

    // support both {items, email} shape and plain array (legacy)
    const items: ClassroomItem[] = Array.isArray(payload)
      ? payload
      : payload.items;
    const email: string = Array.isArray(payload) ? "" : payload.email || "";

    if (!Array.isArray(items)) throw new Error("Not an array");

    await chrome.storage.local.set({
      "gcs-index": JSON.stringify(items),
      "gcs-email": email,
      "gcs-last-updated": Date.now(),
    });

    fuseInstance = null;
    console.log(`[GCS] Index stored — ${items.length} items`);
  } catch (err) {
    console.error("[GCS] fetch failed", err);
    throw err;
  }
}

// ─── Prefix parser ────────────────────────────────────────────────────────────
// > assignment / > material / > announcement  → filter by type
// # course name                               → filter by course
// plain text                                  → fuzzy search

type ParsedQuery =
  | { mode: "fuzzy"; query: string }
  | { mode: "type"; filter: string; subquery: string }
  | { mode: "course"; filter: string; subquery: string };

function parseQuery(raw: string): ParsedQuery {
  if (raw.startsWith(">")) {
    const rest = raw.slice(1).trim();
    const parts = rest.split(" ");
    const filter = parts[0] || "";
    const subquery = parts.slice(1).join(" ").trim();
    return { mode: "type", filter: filter.toLowerCase(), subquery };
  }
  if (raw.startsWith("#")) {
    const rest = raw.slice(1).trim();
    const spaceIdx = rest.search(/\s/);
    const filter = spaceIdx === -1 ? rest : rest.slice(0, spaceIdx);
    const subquery = spaceIdx === -1 ? "" : rest.slice(spaceIdx + 1).trim();
    return { mode: "course", filter: filter.toLowerCase(), subquery };
  }
  return { mode: "fuzzy", query: raw };
}

function applyQuery(data: ClassroomItem[], parsed: ParsedQuery): ClassroomItem[] {
  if (parsed.mode === "type") {
    const map: Record<string, string> = {
      assignment: "Assignment", assignments: "Assignment",
      material: "Material", materials: "Material",
      announcement: "Announcement", announcements: "Announcement",
    };
    const target = map[parsed.filter] || parsed.filter;
    let filtered = data.filter((d) =>
      d.type.toLowerCase().includes(target.toLowerCase())
    );
    if (parsed.subquery) {
      const f = new Fuse(filtered, { keys: ["title", "course"], threshold: 0.35 });
      filtered = f.search(parsed.subquery).map((r) => r.item);
    }
    return filtered;
  }
  if (parsed.mode === "course") {
    const normalized = parsed.filter.replace(/\s+/g, "").toLowerCase();
    let filtered = data.filter((d) =>
      d.course.replace(/\s+/g, "").toLowerCase().includes(normalized)
    );
    if (parsed.subquery) {
      const f = new Fuse(filtered, { keys: ["title", "type"], threshold: 0.35 });
      filtered = f.search(parsed.subquery).map((r) => r.item);
    }
    return filtered;
  }
  if (!parsed.query) return data;
  if (!fuseInstance) {
    fuseInstance = new Fuse(data, {
      keys: ["title", "course", "type"],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 1,
    });
  }
  return fuseInstance.search(parsed.query).map((r) => r.item);
}

// ─── Palette HTML ─────────────────────────────────────────────────────────────

function getPaletteHTML(): string {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      #overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.55);
        z-index: 2147483647; display: flex; align-items: flex-start;
        justify-content: center; padding-top: 14vh; font-family: 'Geist', sans-serif;
      }
      #palette {
        width: 640px; background: #242424; border-radius: 12px;
        border: 1px solid #333; overflow: hidden;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6);
        animation: drop 0.15s cubic-bezier(0.22,1,0.36,1);
      }
      @keyframes drop {
        from { opacity: 0; transform: translateY(-8px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      #search-row {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 16px; border-bottom: 1px solid #2e2e2e;
      }
      .search-icon { color: #555; flex-shrink: 0; }
      #search-input {
        flex: 1; background: none; border: none; outline: none;
        color: #e8e8e8; font-size: 15px; font-family: 'Geist', sans-serif;
        letter-spacing: -0.01em;
      }
      #search-input::placeholder { color: #3a3a3a; }
      .kbd {
        background: #2e2e2e; border: 1px solid #3a3a3a; border-radius: 5px;
        padding: 2px 6px; font-size: 11px; color: #555; font-family: 'Geist Mono', monospace;
        flex-shrink: 0;
      }
      #results { max-height: 400px; overflow-y: auto; }
      #results::-webkit-scrollbar { width: 4px; }
      #results::-webkit-scrollbar-track { background: transparent; }
      #results::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      .section-label {
        padding: 8px 16px 4px; font-size: 11px; color: #555;
        letter-spacing: 0.06em; text-transform: uppercase; font-family: 'Geist Mono', monospace;
      }
      .result-item {
        display: flex; align-items: center; gap: 12px; padding: 8px 16px;
        cursor: pointer; border-left: 2px solid transparent; transition: background 0.08s;
      }
      .result-item:hover, .result-item.active { background: #2e2e2e; border-left-color: #5b6af0; }
      .result-item.active .item-title { color: #fff; }
      .item-icon {
        width: 30px; height: 30px; border-radius: 7px;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .icon-Assignment   { background: #1e2d1e; }
      .icon-Material     { background: #1a2333; }
      .icon-Announcement { background: #2a1f2e; }
      .icon-Class        { background: #2a2010; }
      .item-body { flex: 1; min-width: 0; }
      .item-title {
        font-size: 13.5px; color: #ccc; font-weight: 500;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .item-title .match { color: #fff; font-weight: 600; }
      .item-meta {
        font-size: 11.5px; color: #555; margin-top: 1px;
        font-family: 'Geist Mono', monospace;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .item-type { font-size: 11px; color: #444; font-family: 'Geist Mono', monospace; flex-shrink: 0; }
      #footer {
        display: flex; align-items: center; justify-content: space-between;
        padding: 9px 16px; border-top: 1px solid #2e2e2e;
      }
      .footer-left { display: flex; gap: 12px; align-items: center; }
      .footer-hint { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #444; }
      .footer-right { display: flex; align-items: center; gap: 10px; }
      #result-count { font-family: 'Geist Mono', monospace; font-size: 11px; color: #444; }
      #refresh-btn {
        background: none; border: 1px solid #333; border-radius: 5px;
        color: #555; font-size: 11px; font-family: 'Geist Mono', monospace;
        padding: 2px 8px; cursor: pointer; transition: color 0.1s, border-color 0.1s;
        display: flex; align-items: center; gap: 4px;
      }
      #refresh-btn:hover { color: #aaa; border-color: #555; }
      #refresh-btn.spinning svg { animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      #status-msg { padding: 24px 16px; text-align: center; color: #555; font-size: 12px; font-family: 'Geist Mono', monospace; }
      .hint-bar {
        padding: 6px 16px; border-bottom: 1px solid #2a2a2a;
        display: flex; gap: 16px;
      }
      .hint-pill {
        font-size: 10.5px; color: #444; font-family: 'Geist Mono', monospace;
      }
      .hint-pill span { color: #5b6af0; }
    </style>
    <div id="overlay">
      <div id="palette">
        <div id="search-row">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="#555" stroke-width="1.5"/>
            <path d="M10 10l3.5 3.5" stroke="#555" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input id="search-input" placeholder="Search assignments, files, announcements..." />
          <span class="kbd">esc</span>
        </div>
        <div class="hint-bar">
          <span class="hint-pill"><span>&gt;</span> type</span>
          <span class="hint-pill"><span>#</span> course</span>
        </div>
        <div id="results"><div id="status-msg">Loading...</div></div>
        <div id="footer">
          <div class="footer-left">
            <span class="footer-hint"><span class="kbd">↑↓</span> navigate</span>
            <span class="footer-hint"><span class="kbd">↵</span> open</span>
          </div>
          <div class="footer-right">
            <span id="result-count"></span>
            <button id="refresh-btn">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M9 5A4 4 0 1 1 5 1" stroke="#555" stroke-width="1.3" stroke-linecap="round"/>
                <path d="M5 1l1.5 1.5L5 4" stroke="#555" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function getIcon(type: ClassroomItem["type"]): string {
  switch (type) {
    case "Assignment":
      return `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="#4ade80" stroke-width="1.3"/><path d="M4 5h6M4 7.5h4" stroke="#4ade80" stroke-width="1.1" stroke-linecap="round"/></svg>`;
    case "Material":
      return `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L12 4v6L7 13 2 10V4L7 1z" stroke="#60a5fa" stroke-width="1.3"/></svg>`;
    case "Announcement":
      return `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5h7l2-3v8l-2-3H2V5z" stroke="#c084fc" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
    case "Class":
      return `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="#fbbf24" stroke-width="1.3"/><path d="M1.5 5.5h11" stroke="#fbbf24" stroke-width="1.1"/></svg>`;
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function highlight(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<span class="match">$1</span>',
  );
}

async function renderResults(rawQuery: string): Promise<void> {
  if (!shadowRoot) return;

  const resultsEl = shadowRoot.getElementById("results")!;
  const countEl = shadowRoot.getElementById("result-count")!;

  const stored = await chrome.storage.local.get("gcs-index");
  const data: ClassroomItem[] = JSON.parse(stored["gcs-index"] || "[]");

  if (!data.length) {
    resultsEl.innerHTML = `<div id="status-msg">Fetching your classroom data...</div>`;
    countEl.textContent = "";
    fetchAndStoreIndex()
      .then(() => renderResults(rawQuery))
      .catch(() => {
        if (shadowRoot) {
          shadowRoot.getElementById("results")!.innerHTML =
            `<div id="status-msg">Failed to fetch — check your connection</div>`;
        }
      });
    return;
  }

  const parsed = parseQuery(rawQuery);
  const results = applyQuery(data, parsed);
  current = results;

  if (!rawQuery) {
    // grouped view
    const byType: Record<string, ClassroomItem[]> = {};
    data.forEach((d) => {
      (byType[d.type] = byType[d.type] || []).push(d);
    });
    current = data;

    let html = "";
    (["Assignment", "Material", "Announcement"] as const).forEach((t) => {
      if (!byType[t]?.length) return;
      html += `<div class="section-label">${t}s</div>`;
      byType[t].slice(0, 4).forEach((item) => {
        html += itemHTML(item, "");
      });
    });

    resultsEl.innerHTML = html;
    countEl.textContent = `${data.length} items`;
  } else if (!results.length) {
    resultsEl.innerHTML = `<div id="status-msg">No results for "${rawQuery}"</div>`;
    countEl.textContent = "0 results";
    return;
  } else {
    const q = parsed.mode === "fuzzy" ? parsed.query : "";
    resultsEl.innerHTML = results.map((item) => itemHTML(item, q)).join("");
    countEl.textContent = `${results.length} result${results.length !== 1 ? "s" : ""}`;
  }

  activeIdx = 0;
  setActive();
  attachItemListeners();
}

function itemHTML(item: ClassroomItem, query: string): string {
  return `
    <div class="result-item" data-link="${item.link}">
      <div class="item-icon icon-${item.type}">${getIcon(item.type)}</div>
      <div class="item-body">
        <div class="item-title">${highlight(item.title, query)}</div>
        <div class="item-meta">${item.course}</div>
      </div>
      <div class="item-type">${item.type}</div>
    </div>
  `;
}

function setActive(): void {
  if (!shadowRoot) return;
  shadowRoot.querySelectorAll(".result-item").forEach((el, i) => {
    el.classList.toggle("active", i === activeIdx);
    if (i === activeIdx) el.scrollIntoView({ block: "nearest" });
  });
}

function attachItemListeners(): void {
  if (!shadowRoot) return;
  shadowRoot.querySelectorAll<HTMLElement>(".result-item").forEach((el, i) => {
    el.addEventListener("mouseenter", () => {
      activeIdx = i;
      setActive();
    });
    el.addEventListener("click", () => {
      openActive();
    });
  });
}

function openActive(): void {
  if (!shadowRoot) return;
  const items = shadowRoot.querySelectorAll<HTMLElement>(".result-item");
  const target = items[activeIdx];
  if (target?.dataset.link) {
    // derive account index from current URL (/u/0/, /u/1/, etc.)
    const match = window.location.href.match(/\/u\/(\d+)\//);
    const accountIndex = match ? match[1] : "0";
    const link = `${target.dataset.link}?authuser=${accountIndex}`;
    window.location.href = link;
    closePalette();
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

function openPalette(): void {
  if (paletteRoot) return;

  paletteRoot = document.createElement("div");
  paletteRoot.id = "gcs-palette-host";
  shadowRoot = paletteRoot.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = getPaletteHTML();
  document.body.appendChild(paletteRoot);

  shadowRoot.getElementById("overlay")!.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "overlay") closePalette();
  });

  const input = shadowRoot.getElementById("search-input") as HTMLInputElement;
  input.focus();
  input.addEventListener("input", (e) => {
    fuseInstance = null;
    renderResults((e.target as HTMLInputElement).value.trim());
  });

  // refresh button
  const refreshBtn = shadowRoot.getElementById("refresh-btn")!;
  refreshBtn.addEventListener("click", async () => {
    refreshBtn.classList.add("spinning");
    refreshBtn.setAttribute("disabled", "true");
    try {
      await fetchAndStoreIndex();
      await renderResults(input.value.trim());
    } finally {
      refreshBtn.classList.remove("spinning");
      refreshBtn.removeAttribute("disabled");
    }
  });

  shadowRoot.addEventListener("keydown", (e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === "ArrowDown") {
      ke.preventDefault();
      activeIdx = Math.min(activeIdx + 1, current.length - 1);
      setActive();
    }
    if (ke.key === "ArrowUp") {
      ke.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      setActive();
    }
    if (ke.key === "Enter") {
      openActive();
    }
  });

  renderResults("");
}

function closePalette(): void {
  paletteRoot?.remove();
  paletteRoot = null;
  shadowRoot = null;
  fuseInstance = null;
  current = [];
  activeIdx = 0;
}

// ─── Keyboard shortcut ────────────────────────────────────────────────────────

document.addEventListener(
  "keydown",
  (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      e.stopPropagation();
      paletteRoot ? closePalette() : openPalette();
      return;
    }
    if (e.key === "Escape" && paletteRoot) closePalette();
  },
  true,
);

// ─── Messages ─────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "ACTIVATE_SEARCH")
    paletteRoot ? closePalette() : openPalette();
  if (message.type === "FETCH_INDEX") fetchAndStoreIndex();
});

// ─── On page load ─────────────────────────────────────────────────────────────

chrome.storage.local.get("gcs-index").then((stored) => {
  if (!stored["gcs-index"]) fetchAndStoreIndex();
});
