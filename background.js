let isTranslationActive = false;
let targetLanguage = 'english'; // Default target language

chrome.runtime.onInstalled.addListener(function () {
  // Initialize any necessary configurations here
});

chrome.commands.onCommand.addListener(function (command) {
  // Handle the shortcut command
  if (command === 'translate-shortcut') {
    toggleTranslation();
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Detect URL change and trigger translation if needed
  if (isTranslationActive && changeInfo.url) {
    translateWebsite();
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Handle messages from the popup and content scripts
  if (message.action === 'startTranslation') {
    targetLanguage = message.targetLanguage;
    toggleTranslation();
  } else if (message.action === 'endTranslation') {
    endTranslation();
  }
});

function toggleTranslation() {
  if (isTranslationActive) {
    endTranslation();
  } else {
    startTranslation();
  }
}

function startTranslation() {
  isTranslationActive = true;

  // Notify content script to adjust split screen and highlight text
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'adjustSplitScreen',
      percentage: 50
    });
  });

  // Trigger translation logic
  translateWebsite();
}

function endTranslation() {
  isTranslationActive = false;

  // Notify content script to reset split screen
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'adjustSplitScreen',
      percentage: 100
    });
  });
}

function adjustSplitScreen(percentage) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;

    chrome.tabs.executeScript(tabId, {
      code: `
        // Adjust the split screen based on the given percentage
        const splitPercentage = ${percentage};
        const body = document.body;
        const container = document.createElement('div');
        container.style.width = \`\${100 - splitPercentage}%\`;
        container.style.float = 'left';
        container.style.overflowX = 'hidden';

        const iframe = document.createElement('iframe');
        iframe.src = window.location.href;
        iframe.style.width = '100%';
        iframe.style.height = '100vh';
        iframe.style.border = 'none';

        container.appendChild(iframe);
        body.innerHTML = '';
        body.appendChild(container);
      `
    });
  });
}


function translateWebsite() {
  // Replace 'YOUR_API_KEY' with your actual Google Translate API key
  const apiKey = 'AIzaSyBcRDogQBY0PtET1dopOB4Jluv1Xjc-cG0';
  const apiUrl = 'https://translation.googleapis.com/language/translate/v2';

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;

    // Get the original text from the content of the current tab
    chrome.tabs.executeScript(tabId, {
      code: 'document.body.innerText'
    }, function (results) {
      const originalText = results[0];

      // Make a request to the Google Translate API
      fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: originalText,
          source: 'auto', // Automatically detect the source language
          target: targetLanguage
        })
      })
      .then(response => response.json())
      .then(data => {
        const translatedText = data.data.translations[0].translatedText;

        // Inject the translated text into the content of the current tab
        chrome.tabs.executeScript(tabId, {
          code: `document.body.innerHTML = ${JSON.stringify(translatedText)};`
        });
      })
      .catch(error => {
        console.error('Error translating:', error);
      });
    });
  });
}

