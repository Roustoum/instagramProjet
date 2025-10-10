// button redirection pages 
document.getElementById("dashboard-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('dashboard.html');
}
document.getElementById("logs-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('logs.html');
}
document.getElementById("settings-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('settings.html');
}

//----------------------------------------------------------------------------------------------------------------

// --- Action dropdown ---
const actionDropdown = document.getElementById('action-dropdown');
const actionTrigger = document.getElementById('action-trigger');
const actionMenu = document.getElementById('action-menu');
const actionLabel = document.getElementById('action-label');
const actionIconWrap = document.getElementById('action-icon');
const actionOptions = actionMenu.querySelectorAll('.action-option');

// petites icônes prêtes (même SVG que le menu)
const icons = {
    follow: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         class="size-full">
      <path d="M2 21a8 8 0 0 1 13.292-6"/>
      <circle cx="10" cy="8" r="5"/>
      <path d="M19 16v6"/>
      <path d="M22 19h-6"/>
    </svg>`,
    unfollow: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         class="size-full">
      <path d="M2 21a8 8 0 0 1 13.292-6"/>
      <circle cx="10" cy="8" r="5"/>
      <path d="M22 19H16"/>
    </svg>`,
    'remove-follower': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         class="size-full">
      <path d="M2 21a8 8 0 0 1 13.292-6"/>
      <circle cx="10" cy="8" r="5"/>
      <circle cx="19" cy="19" r="4" fill="none"/>
      <path d="m17.5 17.5 3 3"/>
      <path d="m20.5 17.5-3 3"/>
    </svg>`,
    block: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         class="size-full">
      <path d="M2 21a8 8 0 0 1 11.873-7"/>
      <circle cx="10" cy="8" r="5"/>
      <path d="m17 17 5 5"/>
      <path d="m22 17-5 5"/>
    </svg>`,
};

// ouvrir/fermer
actionTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    actionMenu.classList.toggle('hidden');
});

// fermer au clic extérieur / ESC
document.addEventListener('click', (e) => {
    if (!actionDropdown.contains(e.target)) actionMenu.classList.add('hidden');
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') actionMenu.classList.add('hidden');
});

// appliquer l'état actif + persister
function setAction(actionKey) {
    // style actif sur l’option
    actionOptions.forEach(btn => {
        const isActive = btn.dataset.action === actionKey;
        btn.classList.toggle('bg-indigo-500/10', isActive);
        btn.classList.toggle('dark:bg-indigo-500/15', isActive);
    });

    // label + icône du trigger
    const label = actionKey.replace('-', ' ');
    actionLabel.textContent = label;
    actionIconWrap.innerHTML = icons[actionKey] || icons.follow;

    // persist
    // localStorage.setItem('action', actionKey);

    // hook: ici tu lances ta logique liée à l’action choisie
    // setSelectedAction(actionKey)
}

// choix
actionOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        setAction(btn.dataset.action);
        actionMenu.classList.add('hidden');
    });
});

// init (default = follow)
// setAction(localStorage.getItem('action') || 'follow');

//----------------------------------------------------------------------------------------------------------------

const addBtn = document.getElementById("add-button");
const searchInput = document.getElementById('search-audiences-input');
const listEl = document.getElementById('audiences-list');

let allAudiences = [];

function renderAudiences(items) {
    if (!Array.isArray(items)) return;

    listEl.innerHTML = items.map(({ name, count }) => {
        const badge = (name[0] || "?").toUpperCase();
        return `
        <div class="flex gap-4 xl:gap-[1.2dvw] items-center bg-indigo-400/10 dark:bg-indigo-800/10 p-2 xl:p-[0.6dvw] rounded-lg xl:rounded-[0.6dvw]">
          <div class="w-9 xl:w-[2.7dvw] aspect-square bg-indigo-800 rounded-lg xl:rounded-[0.6dvw] flex-center text-base xl:text-[1.15dvw] font-extrabold text-white">
            ${badge}
          </div>
          <div class="flex flex-col">
            <p class="capitalize text-xs xl:text-[0.86dvw] font-bold text-black dark:text-gray-200">${name}</p>
            <p class="capitalize text-xs xl:text-[0.86dvw] text-gray-700 dark:text-gray-300">${count} profiles</p>
          </div>
        </div>
      `;
    }).join('');
}

// Charge la liste
function loadAudiences() {
    chrome.runtime.sendMessage({ type: "GET_AUDIENCES" }, (res) => {
        if (!res?.ok) return;
        allAudiences = res.items || [];
        applyAudienceFilter(); // rend avec le filtre courant (même si vide)
    });
}

function applyAudienceFilter() {
    const q = (searchInput.value || "").trim().toLowerCase();
    const filtered = q
        ? allAudiences.filter(a => a.name.toLowerCase().includes(q))
        : allAudiences;
    renderAudiences(filtered);
}

addBtn.addEventListener('click', () => {
    const name = (prompt("Add the audience :") || "").trim();
    if (!name) return; // rien à ajouter
    chrome.runtime.sendMessage({ type: "ADD_AUDIENCE", payload: { name } }, (res) => {
        // reset input si ok
        if (res?.ok) {
            searchInput.value = "";
            loadAudiences();
        } else {
            // Optionnel: toast / message d’erreur selon res.error
            // "ALREADY_EXISTS" | "EMPTY_NAME" | ...
        }
    });
});

// Temps réel (si d'autres vues modifient)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.audiences) {
        loadAudiences();
    }
    if (area === "local" && changes.settings_global) {
        const g = changes.settings_global.newValue || {};
        console.log("Theme changed to", g.theme)
        setThemeUI(g.theme || "light");
    }
});

// Init
document.addEventListener('DOMContentLoaded', loadAudiences);
searchInput.addEventListener("input", applyAudienceFilter);

//----------------------------------------------------------------------------------------------------------------

// go to instagram buttons 
document.querySelectorAll('.new-campaign').forEach(btn => {
    btn.onclick = async () => {
        await chrome.tabs.create({ url: 'https://www.instagram.com/' });
    };
});

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