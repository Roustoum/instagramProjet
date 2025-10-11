const closeBtn = document.getElementById("close-button");

closeBtn.addEventListener("click", () => {
    // envoie un message au parent (la page qui a inséré l'iframe)
    window.parent.postMessage({ action: "closeOverlay" }, "*");
});

let postId = null;
let postShort = null;

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
function getPostShort() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { type: "getPostShortcode" },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Erreur:", chrome.runtime.lastError.message);
                    return;
                }
                console.log("Post ID:", response.postShort);
                // Affichage dans la popup
                postShort = response.postShort
                document.getElementById("text").innerHTML +=
                    response.postShort || "No postShort found";
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

function getPostCommenters() {
    if (postShort !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "getPostCommenters", postShort: postShort, after: null, limit: 50 },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur:", chrome.runtime.lastError.message);
                        return;
                    }
                    console.log("Post Commenters:", response.PostCommenters);
                    // Affichage dans la popup
                    document.getElementById("text").innerHTML +=
                        JSON.stringify(response.PostCommenters, null, 2) || "No likers found";
                }
            );
        });
    }
}



document.getElementById('btn-getPostId').addEventListener('click', () => {
    getPostId();
});

document.getElementById('btn-postShort').addEventListener('click', () => {
    getPostShort();
});

document.getElementById('btn-getPostLikers').addEventListener('click', () => {
    getPostLikers();
});

document.getElementById('btn-getPostCommenters').addEventListener('click', () => {
    getPostCommenters();
});


//-----------------------------------------------------------------------------------------------------------------


let scrapeType = "likers";
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

//-----------------------------------------------------------------------------------------------------------------

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