// button redirection pages 
document.getElementById("dashboard-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('dashboard.html');
}
document.getElementById("settings-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('settings.html');
}
document.getElementById("audiences-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('audiences.html');
}

// go to instagram buttons 
document.querySelectorAll('.new-campaign').forEach(btn => {
    btn.onclick = async () => {
        await chrome.tabs.create({ url: 'https://www.instagram.com/' });
    };
});

// ---- Sélecteurs
const $logsContainer = document.getElementById("logs-container");
const $logs = document.getElementById("logs-text");

// ---- Utils
const escapeHTML = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));

const formatLine = (entry) => {
    const base = `[${entry.time}] ${entry.msg}`;
    const meta = entry.meta ? ` ${escapeHTML(JSON.stringify(entry.meta))}` : "";
    return `${escapeHTML(base)}${meta}`;
};

// ---- Fonction de rendu + scroll automatique
const render = (logs) => {
    if (!Array.isArray(logs)) return;
    $logs.innerHTML = logs.map(formatLine).join("<br>");
    // scroll automatique tout en bas
    $logsContainer.scrollTop = $logsContainer.scrollHeight;
};

// ---- Charger les logs au démarrage
chrome.runtime.sendMessage({ type: "GET_LOGS" }, (res) => {
    if (res?.ok) {
        render(res.logs);
    }
});

// ---- Temps réel: écoute des changements storage
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.logs) {
        render(changes.logs.newValue || []);
    }
});

const clearBtn = document.getElementById("clear-logs-button")
clearBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CLEAR_LOGS" });
});

const test = document.getElementById("test")
test.addEventListener("click", () => {
    console.log("test")
    chrome.runtime.sendMessage({ type: "TEST_LOGS" });
})

function setThemeUI(theme) {
    if (theme === "dark")
        document.documentElement.classList.add("dark")
    else {
        document.documentElement.classList.remove("dark")
    }
}

chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (res) => {
    console.log("ani hna !",res.global)
    if (!res?.ok) return;
    const g = res.global || {};
    setThemeUI(g.theme || "light");
})