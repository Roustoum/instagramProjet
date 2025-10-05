chrome.action.disable();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('instagram.com')) {
            chrome.action.enable(tabId);
        } else {
            chrome.action.disable(tabId);
        }
    }
});