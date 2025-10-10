function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    console.log("Tab updated: " + tab.url);
    if (tab.url && tab.url.includes("instagram.com")) {
        chrome.action.enable(activeInfo.tabId);
    } else {
        chrome.action.disable(activeInfo.tabId);
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url) {
        console.log("Tab updated: " + tab.url);
        if (tab.url.includes("instagram.com")) {
            chrome.action.enable(tabId);
        } else {
            chrome.action.disable(tabId);
        }
    }
});

chrome.action.onClicked.addListener(async () => {
    const url = chrome.runtime.getURL('dashboard.html');
    await chrome.tabs.create({ url });
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "getSessionId") {
        chrome.cookies.get(
            { url: "https://www.instagram.com", name: "sessionid" },
            cookie => {
                sendResponse({ sessionid: cookie?.value || null });
            }
        );
        return true; // ⚠️ indispensable pour les réponses asynchrones
    }
});

// ---- Config pour logs
const LOG_KEY = "logs";
const SETTINGS_GLOBAL_KEY = "settings_global";
const SETTINGS_WAITS_KEY = "settings_waits";

const MAX_LOGS = 200;
const DEFAULT_GLOBAL = {
    theme: "light",        // "light" | "dark"
    language: "fr"         // "fr" | "en"
};

const DEFAULT_WAITS = {
    follow: 5,             // sec
    unfollow: 5,
    removedFollower: 5,
    blockUsers: 5,
    randomPercent: 20      // 20–100
};

// Helpers storage
const getLocal = async (key) => {
    const obj = await chrome.storage.local.get(key);
    return obj?.[key];
};
const setLocal = async (key, value) => {
    await chrome.storage.local.set({ [key]: value });
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n | 0));

const getLogs = async () => {
    const { [LOG_KEY]: logs = [] } = await chrome.storage.local.get(LOG_KEY);
    return Array.isArray(logs) ? logs : [];
};

const setLogs = async (logs) => {
    await chrome.storage.local.set({ [LOG_KEY]: logs });
    // Notifie les vues (si ouvertes)
    chrome.runtime.sendMessage({ type: "LOGS_UPDATED" }).catch(() => { });
};

const fmtNow = () =>
    new Date().toLocaleString(undefined, {
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

// ---- API
async function writeLog(message, meta = undefined) {
    const entry = {
        ts: Date.now(),
        time: fmtNow(),
        msg: String(message || ""),
        ...(meta != null ? { meta } : {})
    };

    let logs = await getLogs();
    logs.push(entry);
    if (logs.length > MAX_LOGS) logs = logs.slice(-MAX_LOGS);
    await setLogs(logs);
}

async function clearLogs() {
    await setLogs([]);
}

// ---- Events

chrome.runtime.onInstalled.addListener(async (details) => {
    const existingGlobal = await getLocal(SETTINGS_GLOBAL_KEY);
    const existingWaits = await getLocal(SETTINGS_WAITS_KEY);

    if (!existingGlobal) await setLocal(SETTINGS_GLOBAL_KEY, DEFAULT_GLOBAL);
    if (!existingWaits) await setLocal(SETTINGS_WAITS_KEY, DEFAULT_WAITS);
    await writeLog(`Extension installed at ${fmtNow()} (reason: ${details.reason})`);
});

const test = async () => {
    for (let i = 0; i < 10; ++i) {
        await writeLog(`test log ${i}`)
        await sleep(1000);
    }
}

// Router messages (depuis popup/pages/options/content…)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
        if (msg?.type === "WRITE_LOG") {
            await writeLog(msg.payload?.msg, msg.payload?.meta);
            sendResponse({ ok: true });
        } else if (msg?.type === "CLEAR_LOGS") {
            await clearLogs();
            sendResponse({ ok: true });
        } else if (msg?.type === "GET_LOGS") {
            const logs = await getLogs();
            sendResponse({ ok: true, logs });
        } else if (msg?.type === "TEST_LOGS") {
            test()
            sendResponse({ ok: true })
        } else if (msg?.type === "GET_SETTINGS") {
            const g = (await getLocal(SETTINGS_GLOBAL_KEY)) || DEFAULT_GLOBAL;
            const w = (await getLocal(SETTINGS_WAITS_KEY)) || DEFAULT_WAITS;
            sendResponse({ ok: true, global: g, waits: w });
        } else if (msg?.type === "SET_GLOBAL_SETTINGS") {
            const payload = msg?.payload || {};
            const theme = payload.theme === "dark" ? "dark" : "light";
            const language = payload.language === "en" ? "en" : "fr";
            const newVal = { theme, language };
            await setLocal(SETTINGS_GLOBAL_KEY, newVal);

            if (typeof writeLog === "function") {
                await writeLog("Global settings saved");
            }
            sendResponse({ ok: true });
        } else if (msg?.type === "SET_WAITS_SETTINGS") {
            const p = msg?.payload || {};
            const newWaits = {
                follow: clamp(p.follow ?? 5, 3, 10),
                unfollow: clamp(p.unfollow ?? 5, 3, 10),
                removedFollower: clamp(p.removedFollower ?? 5, 3, 10),
                blockUsers: clamp(p.blockUsers ?? 5, 3, 10),
                randomPercent: clamp(p.randomPercent ?? 20, 20, 100),
            };
            await setLocal(SETTINGS_WAITS_KEY, newWaits);

            if (typeof writeLog === "function") {
                await writeLog("Waits settings saved");
            }
            sendResponse({ ok: true });
        }
    })();
    return true; // async
});

// (Optionnel) expose pour debug via chrome://serviceworker-internals
self.writeLog = writeLog;
self.clearLogs = clearLogs;