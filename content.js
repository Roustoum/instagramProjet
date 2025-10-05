let overlay, toggleBtn;
if (!document.getElementById('insta-bot-toggle')) {
    toggleBtn = document.createElement('div');
    toggleBtn.id = 'insta-bot-toggle';
    toggleBtn.innerHTML = `<img src="${chrome.runtime.getURL('assets/icon48.png')}" alt="Bot" />`;

    // 🔧 Style the floating icon so it’s always visible
    Object.assign(toggleBtn.style, {
        position: 'fixed',
        top: '10px',
        right: '20px',
        zIndex: '10000',
        width: '60px',
        height: '60px',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        borderRadius: '50%',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    document.body.appendChild(toggleBtn);

    // 🖼️ Create overlay iframe for full UI
    overlay = document.createElement('iframe');
    overlay.id = 'insta-bot-ui';
    overlay.src = chrome.runtime.getURL('./popup.html');
    Object.assign(overlay.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        border: 'none',
        zIndex: '9999',
        display: 'none',
        height: '100vh',
    });
    document.body.appendChild(overlay);

    // 📂 Open the extension UI
    toggleBtn.addEventListener('click', () => {
        overlay.style.display = 'block';
        overlay.style.pointerEvents = 'auto';
        toggleBtn.style.display = 'none';
    });
}

window.addEventListener("message", (event) => {
    if (event.data?.action === "closeOverlay") {
        overlay.style.display = "none";
        overlay.style.pointerEvents = "none";
        toggleBtn.style.display = "flex";
    }
});

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