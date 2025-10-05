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

function getInstagramUsername() {
    const path = window.location.pathname;
    const match = path.match(/^\/([^\/\?\#]+)\/?$/);
    if (match && !['explore', 'accounts', 'direct', 'reels'].includes(match[1])) {
        return match[1];
    }
    return null;
}

// fonction avec risque de ban si trop d'appels
async function getUserId(username) {
    const res = await fetch(`https://www.instagram.com/web/search/topsearch/?query=${username}`);
    const data = await res.json();
    const user = data.users.find(u => u.user.username.toLowerCase() === username.toLowerCase());
    return user?.user?.pk || null;
}

// fonction avec risque de ban si trop d'appels
async function fetchProfileDetails(username) {
    try {
        const res = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`, {
            credentials: 'include',
            headers: {
                'x-ig-app-id': '936619743392459'
            }
        });
        const json = await res.json();
        return json?.data?.user || {};
    } catch (e) {
        return {};
    }
}

async function fetchFollowers(userId, after = null) {
    const variables = {
        id: userId,
        include_reel: false,
        fetch_mutual: true,
        first: 50,
        after: after
    };

    const url = `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=${encodeURIComponent(JSON.stringify(variables))}`;
    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();
    return data;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "getInstagramUsername") {
        const username = getInstagramUsername();
        sendResponse({ username: username || null });
        return true;
    }

    if (msg.type === "getUserId") {
        console.log(msg.username)
        getUserId(msg.username).then(id => sendResponse({ userId: id || null }));
        return true;
    }

    if (msg.type === "fetchProfileDetails") {
        console.log(msg.username)
        fetchProfileDetails(msg.username).then(data => sendResponse({ userData: data || null }));
        return true;
    }

    if (msg.type === "fetchFollowers") {
        console.log(msg.userId, msg.after)
        fetchFollowers(msg.userId).then(data => sendResponse({ userData: data || null }));
        return true;
    }
});