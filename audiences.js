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

// go to instagram buttons 
document.querySelectorAll('.new-campaign').forEach(btn => {
    btn.onclick = async () => {
        await chrome.tabs.create({ url: 'https://www.instagram.com/' });
    };
});

// test dark mode 
const logo = document.getElementById('logo');
logo.onclick = () => {
    if (document.documentElement.classList.contains("dark"))
        document.documentElement.classList.remove("dark")
    else {
        document.documentElement.classList.add("dark")
    }
}