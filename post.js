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
                { type: "getPostCommenters", postShort: postShort,after : null, limit: 50 },
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