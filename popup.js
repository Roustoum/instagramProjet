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

function removeFollowerUser() {
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

function blockUser() {
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


//--------------------------------------------------------------------------------------------------------------------------------

let scrapeType = "following";
let scrapeMode = "light";
let selectedAudience = "default";
let allAudiences = [];

// === Scrape Type dropdown ===
const typeTrigger = document.getElementById("scrape-type-trigger");
const typeMenu = document.getElementById("scrape-type-menu");
const typeLabel = document.getElementById("scrape-type-label");
const typeOptions = document.querySelectorAll(".scrape-type-option");

typeTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    typeMenu.classList.toggle("hidden");
});
document.addEventListener("click", (e) => {
    if (!typeTrigger.contains(e.target)) typeMenu.classList.add("hidden");
});
typeOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
        scrapeType = opt.dataset.type;
        typeLabel.textContent = opt.textContent.trim();
        typeMenu.classList.add("hidden");
    });
});

// === Scrape Mode buttons ===
const lightBtn = document.getElementById("light-scrape-btn");
const fullBtn = document.getElementById("full-scrape-btn");
const lightBtnText = lightBtn.querySelector("p");
const fullBtnText = fullBtn.querySelector("p");

function setActive(btn, txt) {
    btn.classList.add("bg-green-400/10", "border-green-700", "hover:bg-green-400/20");
    btn.classList.remove("bg-gray-400/20", "border-gray-700", "hover:bg-gray-400/40");
    txt.classList.add("text-green-700", "dark:text-green-400");
    txt.classList.remove("text-gray-700", "dark:text-gray-400");
}

function setInactive(btn, txt) {
    btn.classList.add("bg-gray-400/20", "border-gray-700", "hover:bg-gray-400/40");
    btn.classList.remove("bg-green-400/10", "border-green-700", "hover:bg-green-400/20");
    txt.classList.add("text-gray-700", "dark:text-gray-400");
    txt.classList.remove("text-green-700", "dark:text-green-400");
}

function updateModeUI() {
    if (scrapeMode === "light") {
        setActive(lightBtn, lightBtnText);
        setInactive(fullBtn, fullBtnText);
    } else {
        setActive(fullBtn, fullBtnText);
        setInactive(lightBtn, lightBtnText);
    }
}

lightBtn.addEventListener("click", () => {
    scrapeMode = "light";
    updateModeUI();
});
fullBtn.addEventListener("click", () => {
    scrapeMode = "full";
    updateModeUI();
});
updateModeUI();

// === Audience dropdown ===
const audTrigger = document.getElementById("audience-trigger");
const audMenu = document.getElementById("audience-menu");
const audLabel = document.getElementById("audience-label");

function renderAudiences() {
    audMenu.innerHTML = allAudiences
        .map(a => `<button data-aud="${a.name}" class="aud-option w-full text-left px-3 h-9 text-sm
      text-gray-800 dark:text-gray-200 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15 transition-colors">
      ${a.name}</button>`)
        .join("");

    document.querySelectorAll(".aud-option").forEach(btn => {
        btn.addEventListener("click", () => {
            selectedAudience = btn.dataset.aud;
            audLabel.textContent = selectedAudience;
            audMenu.classList.add("hidden");
        });
    });
}

function loadAudiences() {
    chrome.runtime.sendMessage({ type: "GET_AUDIENCES" }, (res) => {
        if (!res?.ok) return;
        allAudiences = res.items || [];
        renderAudiences();
    });
}

audTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    audMenu.classList.toggle("hidden");
});
document.addEventListener("click", (e) => {
    if (!audTrigger.contains(e.target)) audMenu.classList.add("hidden");
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.audiences) loadAudiences();

    if (area === "local" && changes.settings_global) {
        const g = changes.settings_global.newValue || {};
        setThemeUI(g.theme || "light");
    }
});

document.addEventListener("DOMContentLoaded", loadAudiences);

//---------------------------------------------------------------------------------------------------------------

function setThemeUI(theme) {
    if (theme === "dark")
        document.documentElement.classList.add("dark")
    else {
        document.documentElement.classList.remove("dark")
    }
}

chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (res) => {
    if (!res?.ok) return;
    const g = res.global || {};
    setThemeUI(g.theme || "light");
})