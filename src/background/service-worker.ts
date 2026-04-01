const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbylS5uf1wNaFOIqMll0In2ulVvv4w5aSUnwGfz-vHc1pUZFNfo7JejqyhUVlXVFsqC4tQ/exec";

const STORAGE_KEY = "gcs-index";
const ALARM_NAME = "gcs-refresh";
const REFRESH_MINUTES = 30;


async function refreshIndex(): Promise<void> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", APPS_SCRIPT_URL, true);
    xhr.onload = async () => {
      try {
        const items = JSON.parse(xhr.responseText);
        if (!Array.isArray(items)) throw new Error("Not an array");
        await chrome.storage.local.set({
          [STORAGE_KEY]: JSON.stringify(items),
          "gcs-last-updated": Date.now(),
        });
        console.log(`[GCS] Index refreshed — ${items.length} items`);
      } catch (err) {
        console.error("[GCS] Parse error:", err);
      }
      resolve();
    };
    xhr.onerror = () => {
      console.error("[GCS] XHR failed");
      resolve();
    };
    xhr.send();
  });
}


chrome.runtime.onInstalled.addListener(async () => {
  console.log("[GCS] Extension installed");
  await refreshIndex();
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: REFRESH_MINUTES });
});


chrome.runtime.onStartup.addListener(async () => {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (!alarm) {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: REFRESH_MINUTES });
  }
  await refreshIndex();
});


chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) refreshIndex();
});


chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "ACTIVATE_SEARCH") {
  }

  if (message.type === "FORCE_REFRESH") {
    refreshIndex().then(() => sendResponse({ ok: true }));
    return true;
  }
});
