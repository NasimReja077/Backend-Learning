// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCurrentTabUrl') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        sendResponse({ url: tabs[0].url });
      } else {
        sendResponse({ error: "Could not get current tab" });
      }
    });
    return true;
  }
});