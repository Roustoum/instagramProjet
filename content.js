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

// function helpers
function shortcodeToInstaID(shortcode) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let id = BigInt(0);
    for (let i = 0; i < shortcode.length; i++) {
        id = id * 64n + BigInt(alphabet.indexOf(shortcode[i]));
    }
    return id.toString();
}

function getCsrfFromCookie() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1] || '';
}

//---------------------------------------------------

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

async function fetchFollowing(userId, after = null) {
    const variables = {
        id: userId,
        include_reel: false,
        fetch_mutual: true,
        first: 50,
        after: after
    };
    const url = `https://www.instagram.com/graphql/query/?query_hash=c56ee0ae1f89cdbd1c89e2bc6b8f3d18&variables=${encodeURIComponent(JSON.stringify(variables))}`;
    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();
    return data;
}

async function getPostID() {
    const url = window.location.href;
    let shorty;
    if (url.includes('/p/')) {
        shorty = url.split('/p/')[1].split('/')[0];
    } else if (url.includes('/reel/')) {
        shorty = url.split('/reel/')[1].split('/')[0];
    } else {
        return null;
    }
    const mediaId = shortcodeToInstaID(shorty);
    return mediaId;
}

async function getPostLikers(postId, max_id = null) {
    let csrfToken = getCsrfFromCookie();
    if (!csrfToken) {
        console.log("pas de csrftoken !")
        return null;
    }
    let endpoint = `https://www.instagram.com/api/v1/media/${postId}/likers/`;
    if (max_id) endpoint += `?max_id=${max_id}`;
    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            "X-Csrftoken": csrfToken,
            "x-instagram-ajax": "1010212815",
            "x-asbd-id": "129477",
            "x-ig-app-id": "936619743392459"
        },
        credentials: "include"
    });

    const data = await response.json();
    console.log(data?.users?.length);
    max_id = data.next_max_id;
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

    if (msg.type === "getPostID") {
        getPostID().then(data => sendResponse({ postId: data || null }));
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

    if (msg.type === "fetchFollowing") {
        console.log(msg.userId, msg.after)
        fetchFollowing(msg.userId).then(data => sendResponse({ userData: data || null }));
        return true;
    }

    if (msg.type === "getPostLikers") {
        console.log(msg.max_id, msg.postId)
        getPostLikers(msg.postId, msg.max_id).then(data => sendResponse({ PostLikers: data || null }));
        return true;
    }


});