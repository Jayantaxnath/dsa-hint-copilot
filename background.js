// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to show next hint
  chrome.tabs.sendMessage(tab.id, { action: "showNextHint" });
});
