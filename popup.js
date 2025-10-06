const closeBtn = document.getElementById("close-button");

closeBtn.addEventListener("click", () => {
    // envoie un message au parent (la page qui a inséré l'iframe)
    window.parent.postMessage({ action: "closeOverlay" }, "*");
});

let username = null;
let userId = null;
let postId = null;
function getUserName() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "getInstagramUsername" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Erreur:", chrome.runtime.lastError.message);
                username = null;
                return;
            }
            document.getElementById("text").innerHTML += response.username || "No username found";
            username = response.username;
            console.log("Instagram username:", username);
        });
    });
}

function getUserId() {
    if (username !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "getUserId", username: username },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur:", chrome.runtime.lastError.message);
                        userId = null;
                        return;
                    }
                    document.getElementById("text").innerHTML +=
                        response.userId || "No userId found";
                    userId = response.userId;
                    console.log("Instagram userId:", userId);
                }
            );
        });
    }
}

function getProfileDetails() {
    if (username !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "fetchProfileDetails", username: username },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur:", chrome.runtime.lastError.message);
                        return;
                    }
                    console.log("Profile details:", response.userData);
                    // Affiche les données dans ta popup
                    document.getElementById("text").innerHTML +=
                        JSON.stringify(response.userData, null, 2) || "No data found";
                }
            );
        });
    }
}

function getFollowers() {
    if (userId !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "fetchFollowers", userId: userId, after: null },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur:", chrome.runtime.lastError.message);
                        return;
                    }
                    console.log("Followers:", response.userData);
                    // Affiche dans ta popup
                    document.getElementById("text").innerHTML +=
                        JSON.stringify(response.userData, null, 2) || "No followers";
                }
            );
        });
    }
}

function getFollowing() {
    if (userId !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "fetchFollowing", userId: userId, after: null },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur:", chrome.runtime.lastError.message);
                        return;
                    }
                    console.log("Following:", response.userData);
                    // Affichage dans la popup
                    document.getElementById("text").innerHTML +=
                        JSON.stringify(response.userData, null, 2) || "No following";
                }
            );
        });
    }
}

function getPostId() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { type: "getPostID" },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Erreur:", chrome.runtime.lastError.message);
                    return;
                }
                console.log("Post ID:", response.postId);
                // Affichage dans la popup
                postId = response.postId
                document.getElementById("text").innerHTML +=
                    response.postId || "No postId found";
            }
        );
    });
}

function getPostLikers() {
    if (postId !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "getPostLikers", postId: postId, max_id: null },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur:", chrome.runtime.lastError.message);
                        return;
                    }
                    console.log("Post Likers:", response.PostLikers);
                    // Affichage dans la popup
                    document.getElementById("text").innerHTML +=
                        JSON.stringify(response.PostLikers, null, 2) || "No likers found";
                }
            );
        });
    }
}


document.getElementById('btn-userName').addEventListener('click', () => {
    getUserName();
});

document.getElementById('btn-userID').addEventListener('click', () => {
    getUserId();
});

document.getElementById('btn-userDetails').addEventListener('click', () => {
    getProfileDetails();
});

document.getElementById('btn-userFollowrs').addEventListener('click', () => {
    getFollowers();
});

document.getElementById('btn-userFollowing').addEventListener('click', () => {
    getFollowing();
});

document.getElementById('btn-getPostId').addEventListener('click', () => {
    getPostId();
});

document.getElementById('btn-getPostLikers').addEventListener('click', () => {
    getPostLikers();
});