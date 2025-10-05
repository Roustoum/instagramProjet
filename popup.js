
function test() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "getInstagramUsername" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Erreur:", chrome.runtime.lastError.message);
                return;
            }
            document.getElementById("tttt").innerHTML = response.username || "No username found";
            console.log("Instagram username:", response.username);
        });
    });
}

document.getElementById('btn-test').addEventListener('click', test);