chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {

      chrome.tabs.executeScript(tabId, { file: 'content_script.js' });
    }
  });

  chrome.tabs.onCreated.addListener((tab) => {
    chrome.tabs.executeScript(tab.id, { file: 'content_script.js' });
  });
  
  