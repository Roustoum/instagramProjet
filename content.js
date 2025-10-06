function getPostID() {
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

function getPostShortcode() {
    const url = window.location.href;
    let shorty;
    if (url.includes('/p/')) {
        shorty = url.split('/p/')[1].split('/')[0];
    } else if (url.includes('/reel/')) {
        shorty = url.split('/reel/')[1].split('/')[0];
    } else {
        return null;
    }
    return shorty;
}

function getInstagramUsername() {
    const path = window.location.pathname;
    const match = path.match(/^\/([^\/\?\#]+)\/?$/);
    if (match && !['explore', 'accounts', 'direct', 'reels'].includes(match[1])) {
        return match[1];
    }
    return null;
}

(() => {
    // --- 🔁 Détection navigation interne (SPA) ---
    let lastUrl = location.href;

    const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            console.log("URL changed to: ", lastUrl, getInstagramUsername(), getPostID());
            onUrlChange(); // relance ton code quand l’URL change
        }
    });

    observer.observe(document, { childList: true, subtree: true });

    // --- 🧠 Fonction principale ---
    function onUrlChange() {
        const username = getInstagramUsername();
        const postId = getPostID();
        console.log("Current username:", username, " postId:", postId);
        // Supprime les anciens éléments si tu quittes le profil
        const oldToggle = document.getElementById('insta-bot-toggle');
        const oldOverlay = document.getElementById('insta-bot-ui');
        if (oldToggle) oldToggle.remove();
        if (oldOverlay) oldOverlay.remove();



        // Évite les doublons
        if (document.getElementById('insta-bot-toggle')) return;

        // --- 🚀 Création du bouton et overlay ---
        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'insta-bot-toggle';
        toggleBtn.innerHTML = `<img src="${chrome.runtime.getURL('assets/icon48.png')}" alt="Bot" />`;

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

        const overlay = document.createElement('iframe');
        overlay.id = 'insta-bot-ui';

        if (username) {
            overlay.src = chrome.runtime.getURL('./popup.html');
        } else if (postId) {
            overlay.src = chrome.runtime.getURL('./post.html');
        }
        Object.assign(overlay.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            border: 'none',
            zIndex: '9999',
            display: 'none',
            height: '100vh',
        });

        document.body.appendChild(toggleBtn);
        document.body.appendChild(overlay);

        toggleBtn.addEventListener('click', () => {
            overlay.style.display = 'block';
            overlay.style.pointerEvents = 'auto';
            toggleBtn.style.display = 'none';
        });

        window.addEventListener('message', (event) => {
            if (event.data?.action === 'closeOverlay') {
                overlay.style.display = 'none';
                overlay.style.pointerEvents = 'none';
                toggleBtn.style.display = 'flex';
            }
        });
    }

    // 🟢 Démarrage initial
    onUrlChange();
})();


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

async function getPostCommenters(postShort, after = null, limit = 50) {
    const query_hash = "97b41c52301f77ce508f55e66d17620e";
    let count = 0;
    let csrfToken = getCsrfFromCookie();
    if (!csrfToken) {
        console.log("pas de csrftoken !")
        return null;
    }
    console.log(postShort, after, limit)
    const first = Math.min(50, limit - count);
    const variables = encodeURIComponent(JSON.stringify({
        shortcode: postShort,
        first,
        after
    }));

    const fetchUrl = `https://www.instagram.com/graphql/query/?query_hash=${query_hash}&variables=${variables}`;
    const response = await fetch(fetchUrl, {
        method: "GET",
        credentials: "include",
        headers: {
            "X-Csrftoken": csrfToken,
            "x-instagram-ajax": "1010212815",
            "x-asbd-id": "129477",
            "x-ig-app-id": "936619743392459"
        }
    });
    const data = await response.json();
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
        console.log("getting post id")
        const postId = getPostID()
        sendResponse({ postId: postId || null });
        return true;
    }
    if (msg.type === "getPostShortcode") {
        console.log("getting post Shortcode")
        const postShort = getPostShortcode()
        sendResponse({ postShort: postShort || null });
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

    if(msg.type === "getPostCommenters") {
        console.log(msg.postShort, msg.after, msg.limit)
        getPostCommenters(msg.postShort, msg.after, msg.limit).then(data => sendResponse({ PostCommenters: data || null }));
        return true;
    }
});