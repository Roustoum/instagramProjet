
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    console.log("Tab updated: " + tab.url);
    if (tab.url && tab.url.includes("instagram.com")) {
        chrome.action.enable(activeInfo.tabId);
    } else {
        chrome.action.disable(activeInfo.tabId);
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url) {
        console.log("Tab updated: " + tab.url);
        if (tab.url.includes("instagram.com")) {
            chrome.action.enable(tabId);
        } else {
            chrome.action.disable(tabId);
        }
    }
});

chrome.action.onClicked.addListener(async () => {
    const url = chrome.runtime.getURL('dashboard.html');
    await chrome.tabs.create({ url });
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "getSessionId") {
        chrome.cookies.get(
            { url: "https://www.instagram.com", name: "sessionid" },
            cookie => {
                sendResponse({ sessionid: cookie?.value || null });
            }
        );
        return true; // ⚠️ indispensable pour les réponses asynchrones
    }
});
 