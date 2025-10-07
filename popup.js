const closeBtn = document.getElementById("close-button");

closeBtn.addEventListener("click", () => {
    // envoie un message au parent (la page qui a inséré l'iframe)
    window.parent.postMessage({ action: "closeOverlay" }, "*");
});

let username = null;
let userId = null;

// async function getUserDetails(userId) {
//     const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
    
//     // Étape 1: ID -> Username
//     const res1 = await fetch(`https://i.instagram.com/api/v1/users/${userId}/info/`, {
//       headers: {
//         "x-csrftoken": csrfToken,
//         "x-ig-app-id": "936619743392459"
//       },
//       credentials: "include"
//     });
//     const data1 = await res1.json();
//     console.log(data1);
// }

// getUserDetails("60880119431");

function getCurrentUserId() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "getCurrentUser" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Erreur:", chrome.runtime.lastError.message);
                return;
            }
            userId = response.userData;
            document.getElementById("text").innerHTML +=
                JSON.stringify(response.userData, null, 2) || "No current user";
        });
    });
}
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

function followUser() {
    if (userId !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "followUser", userId: userId },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur:", chrome.runtime.lastError.message);
                        return;
                    }
                    console.log("Follow response:", response.success);
                    document.getElementById("text").innerHTML +=
                        response.success || "No response";
                }
            );
        });
    }
}

function unfollowUser() {
    if (userId !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "unfollowUser", userId: userId },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur:", chrome.runtime.lastError.message);
                        return;
                    }
                    console.log("Unfollow response:", response.success);
                    document.getElementById("text").innerHTML +=
                        response.success || "No response";
                }
            );
        });
    }
}

function removeFollowerUser(){
    if (userId !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "removeFollowerUser", userId: userId },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur:", chrome.runtime.lastError.message);
                        return;
                    }
                    console.log("Remove follower response:", response.success);
                    document.getElementById("text").innerHTML +=
                        response.success || "No response";
                }
            );
        });
    }
}

function blockUser(){
    if (userId !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "blockUser", userId: userId },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur:", chrome.runtime.lastError.message);
                        return;
                    }
                    console.log("Block user response:", response.success);
                    document.getElementById("text").innerHTML +=
                        response.success || "No response";
                }
            );
        });
    }
}

document.getElementById('btn-getCurrentUser').addEventListener('click', () => {
    getCurrentUserId();
});

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

document.getElementById('btn-followUser').addEventListener('click', () => {
    followUser();
});

document.getElementById('btn-unfollowUser').addEventListener('click', () => {
    unfollowUser();
});

document.getElementById('btn-removeFollowerUser').addEventListener('click', () => {
    removeFollowerUser();
});

document.getElementById('btn-blockUser').addEventListener('click', () => {
    blockUser();
});