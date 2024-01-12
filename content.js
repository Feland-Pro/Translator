chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Handle messages from the background script
  if (message.action === 'highlightText') {
    // Implement text highlighting logic
  }
});
