const STORAGE_KEY = "gcs-index";
const ALARM_NAME = "gcs-refresh";
const REFRESH_MINUTES = 30;

// Service worker only manages alarms and forwards messages.
// Fetching is done by the content script to avoid CORS issues.

chrome.runtime.onInstalled.addListener((details) => {
  console.log("[GCS] Extension installed");
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: REFRESH_MINUTES });

  if (details.reason === "install") {
    setTimeout(() => {
      chrome.tabs.query({ url: "*://classroom.google.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) chrome.tabs.sendMessage(tab.id, { type: "SHOW_TOAST" });
        });
      });
    }, 1500);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (!alarm) {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: REFRESH_MINUTES });
  }
});

// On alarm, tell all classroom tabs to refresh their index
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  chrome.tabs.query({ url: "*://classroom.google.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) chrome.tabs.sendMessage(tab.id, { type: "FETCH_INDEX" });
    });
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "ACTIVATE_SEARCH") {
    // handled directly by content script keyboard shortcut
  }
  if (message.type === "FORCE_REFRESH") {
    chrome.tabs.query({ url: "*://classroom.google.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) chrome.tabs.sendMessage(tab.id, { type: "FETCH_INDEX" });
      });
    });
    sendResponse({ ok: true });
  }
});