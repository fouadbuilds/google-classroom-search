chrome.commands.onCommand.addListener((command: string) => {
  if (command === "activate-search") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id && activeTab.url?.includes("classroom.google.com")) {
        chrome.tabs.sendMessage(activeTab.id, { type: "ACTIVATE_SEARCH" });
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Google Classroom Search extension installed");
});
