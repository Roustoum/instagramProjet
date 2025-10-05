// alert("hih ak fel instagram !")

function getInstagramUsername() {
    const path = window.location.pathname;
    const match = path.match(/^\/([^\/\?\#]+)\/?$/);
    if (match && !['explore', 'accounts', 'direct', 'reels'].includes(match[1])) {
        return match[1];
    }
    return null;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "getInstagramUsername") {
        const username = getInstagramUsername();
        sendResponse({ username: username || null });
        return true;
    }
});