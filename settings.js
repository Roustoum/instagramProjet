// button redirection pages 
document.getElementById("dashboard-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('dashboard.html');
}
document.getElementById("logs-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('logs.html');
}
document.getElementById("audiences-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('audiences.html');
}

//----------------------------------------------------------------------------------------------------------------

// util: clamp
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

document.querySelectorAll('[data-stepper]').forEach((wrap) => {
    const min = Number(wrap.dataset.min || 0);
    const max = Number(wrap.dataset.max || 100);
    const step = Number(wrap.dataset.step || 1);

    const input = wrap.querySelector('input.val');
    const dec = wrap.querySelector('button.dec');
    const inc = wrap.querySelector('button.inc');

    // sécurité bornes à l'init
    input.value = clamp(Number(input.value || min), min, max);

    dec.addEventListener('click', () => {
        const next = clamp(Number(input.value) - step, min, max);
        input.value = next;
        input.dispatchEvent(new Event('change'));
    });

    inc.addEventListener('click', () => {
        const next = clamp(Number(input.value) + step, min, max);
        input.value = next;
        input.dispatchEvent(new Event('change'));
    });

    // validation manuelle clavier
    input.addEventListener('input', () => {
        // garde uniquement chiffres et borne en douceur
        const n = Number(input.value.replace(/[^0-9.-]/g, ''));
        if (!Number.isNaN(n)) input.value = n;
    });
    input.addEventListener('blur', () => {
        input.value = clamp(Number(input.value || min), min, max);
    });
});

//----------------------------------------------------------------------------------------------------------------

// go to instagram buttons 
document.querySelectorAll('.new-campaign').forEach(btn => {
    btn.onclick = async () => {
        await chrome.tabs.create({ url: 'https://www.instagram.com/' });
    };
});

// =============== Sélecteurs ===============
const themeToggle = document.getElementById("theme-toggle");

// --- Dropdown langue (ton code conservé + léger refactor)
const langDropdown = document.getElementById('lang-dropdown');
const langTrigger = document.getElementById('lang-trigger');
const langMenu = document.getElementById('lang-menu');
const langLabel = document.getElementById('lang-label');
const langOptions = langMenu.querySelectorAll('.lang-option');

const saveGlobalBtn = document.getElementById("save-global-settings");
const saveWaitsBtn = document.getElementById("save-waits-settings");

const waitFollow = document.getElementById("wait-follow");
const waitUnfollow = document.getElementById("wait-unfollow");
const waitRemoved = document.getElementById("wait-removed");
const waitBlock = document.getElementById("wait-block");
const waitRandom = document.getElementById("wait-random");

// =============== État local ===============
let currentLanguage = "fr";

// =============== Helpers UI ===============
function setThemeUI(theme) {
    themeToggle.checked = (theme === "dark");
    if (theme === "dark")
        document.documentElement.classList.add("dark")
    else {
        document.documentElement.classList.remove("dark")
    }
}
function setLangUI(code) {
    currentLanguage = (code === "en" ? "en" : "fr");
    langLabel.textContent = currentLanguage === "en" ? "English" : "Français";

    // styles actifs du menu
    langOptions.forEach(btn => {
        const isActive = btn.dataset.lang === currentLanguage;
        btn.classList.toggle('bg-indigo-500/10', isActive);
        btn.classList.toggle('dark:bg-indigo-500/15', isActive);
    });
}
function toInt(el, def) {
    const n = parseInt(el?.value, 10);
    return Number.isFinite(n) ? n : def;
}

// =============== API Background ===============
function loadSettings() {
    chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (res) => {
        if (!res?.ok) return;

        const g = res.global || {};
        const w = res.waits || {};

        setThemeUI(g.theme || "light");
        setLangUI(g.language || "fr");

        if (waitFollow) waitFollow.value = w.follow ?? 5;
        if (waitUnfollow) waitUnfollow.value = w.unfollow ?? 5;
        if (waitRemoved) waitRemoved.value = w.removedFollower ?? 5;
        if (waitBlock) waitBlock.value = w.blockUsers ?? 5;
        if (waitRandom) waitRandom.value = w.randomPercent ?? 20;
    });
}

function saveGlobal() {
    const theme = themeToggle.checked ? "dark" : "light";
    const language = currentLanguage;

    chrome.runtime.sendMessage({
        type: "SET_GLOBAL_SETTINGS",
        payload: { theme, language }
    }, () => { });
}

function saveWaits() {
    const payload = {
        follow: toInt(waitFollow, 5),
        unfollow: toInt(waitUnfollow, 5),
        removedFollower: toInt(waitRemoved, 5),
        blockUsers: toInt(waitBlock, 5),
        randomPercent: toInt(waitRandom, 20),
    };
    chrome.runtime.sendMessage({
        type: "SET_WAITS_SETTINGS",
        payload
    }, () => { });
}

// =============== Events UI ===============

themeToggle.addEventListener("change", () => {
    const theme = themeToggle.checked ? "dark" : "light";
    setThemeUI(theme);
});

// Dropdown langue: ouvrir/fermer
langTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('hidden');
});
// fermer au clic extérieur / ESC
document.addEventListener('click', (e) => {
    if (!langDropdown.contains(e.target)) langMenu.classList.add('hidden');
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') langMenu.classList.add('hidden');
});
// sélection option langue
langOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        setLangUI(btn.dataset.lang);
        langMenu.classList.add('hidden');
    });
});

// Boutons Save
saveGlobalBtn?.addEventListener("click", saveGlobal);
saveWaitsBtn?.addEventListener("click", saveWaits);

// Init
document.addEventListener("DOMContentLoaded", loadSettings);