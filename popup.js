const closeBtn = document.getElementById("close-button");

closeBtn.addEventListener("click", () => {
    // envoie un message au parent (la page qui a inséré l'iframe)
    window.parent.postMessage({ action: "closeOverlay" }, "*");
});

let username = null;

function getUserName() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "getInstagramUsername" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Erreur:", chrome.runtime.lastError.message);
                username = null;
                return;
            }
            document.getElementById("tttt").innerHTML = response.username || "No username found";
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
                    document.getElementById("text").innerHTML =
                        response.userId || "No userId found";
                    userId = response.userId;
                    console.log("Instagram userId:", userId);
                }
            );
        });
    }
}

document.getElementById('btn-test').addEventListener('click', () => {
    getUserName();
    getUserId(username);
});

