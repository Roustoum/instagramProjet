// dashboard.js
const newCampaignButtons = document.querySelectorAll('.new-campaign');
newCampaignButtons.forEach(btn => {
    btn.onclick = async () => {
        await chrome.tabs.create({ url: 'https://www.instagram.com/' });
    };
});

//----------------------------------------------------------------------------------------------------------------
const buttons = document.querySelectorAll('button[id$="-button"]');
const sections = document.querySelectorAll('div[id$="-content"]');

// fonction pour activer un bouton et afficher la section
function activateSection(button) {
    // reset tous les boutons
    buttons.forEach((btn) => {
        btn.classList.remove('bg-indigo-400/20', 'hover:bg-indigo-400/40');
        btn.classList.add('hover:bg-indigo-400/10');

        const svg = btn.querySelector('svg');
        const p = btn.querySelector('p');

        svg.classList.remove('stroke-indigo-700', 'dark:stroke-indigo-400', 'group-hover:stroke-indigo-900', 'dark:group-hover:stroke-indigo-200');
        svg.classList.add('stroke-black', 'dark:stroke-white', 'group-hover:stroke-indigo-500', 'dark:group-hover:stroke-indigo-300');

        p.classList.remove('text-indigo-700', 'dark:text-indigo-400', 'group-hover:text-indigo-900', 'dark:group-hover:text-indigo-200');
        p.classList.add('text-black', 'dark:text-white', 'group-hover:text-indigo-500', 'dark:group-hover:text-indigo-300');
    });

    // cacher toutes les sections
    sections.forEach(section => section.classList.add('hidden'));

    // afficher la section correspondante
    const sectionId = button.id.replace('-button', '-content');
    document.getElementById(sectionId).classList.remove('hidden');

    // activer le style du bouton cliqué
    button.classList.toggle('bg-indigo-400/20');
    button.classList.toggle('hover:bg-indigo-400/40');
    button.classList.toggle('hover:bg-indigo-400/10');

    const svg = button.querySelector('svg');
    const p = button.querySelector('p');

    svg.classList.toggle('stroke-indigo-700');
    svg.classList.toggle('dark:stroke-indigo-400');
    svg.classList.toggle('stroke-black');
    svg.classList.toggle('dark:stroke-white');

    p.classList.toggle('text-indigo-700');
    p.classList.toggle('dark:text-indigo-400');
    p.classList.toggle('text-black');
    p.classList.toggle('dark:text-white');
}
// gestion du clic
buttons.forEach((button) => {
    button.addEventListener('click', () => activateSection(button));
});

// document.getElementById("audiences-button").click(); // section par défaut
//----------------------------------------------------------------------------------------------------------------
// Sélectionne les trois boutons
const dayButtons = document.querySelectorAll('#to-day, #\\37-day, #\\33 0-day');

dayButtons.forEach((button) => {
    button.addEventListener('click', () => {
        // 🔹 Réinitialiser tous les boutons
        dayButtons.forEach((btn) => {
            btn.classList.remove('bg-indigo-400', 'hover:bg-indigo-500');
            btn.classList.add('bg-indigo-400/20', 'hover:bg-indigo-400/40');

            const p = btn.querySelector('p');
            p.classList.remove('text-white', 'group-hover:text-gray-100');
            p.classList.add('text-indigo-700', 'dark:text-indigo-400', 'group-hover:text-indigo-900', 'dark:group-hover:text-indigo-200');
        });

        // 🔹 Activer le bouton cliqué
        button.classList.remove('bg-indigo-400/20', 'hover:bg-indigo-400/40');
        button.classList.add('bg-indigo-400', 'hover:bg-indigo-500');

        const p = button.querySelector('p');
        p.classList.remove('text-indigo-700', 'dark:text-indigo-400', 'group-hover:text-indigo-900', 'dark:group-hover:text-indigo-200');
        p.classList.add('text-white', 'group-hover:text-gray-100');
    });
});

//----------------------------------------------------------------------------------------------------------------
const logo = document.getElementById('logo');
logo.onclick = () => {
    if (document.documentElement.classList.contains("dark"))
        document.documentElement.classList.remove("dark")
    else {
        document.documentElement.classList.add("dark")
    }

}

//----------------------------------------------------------------------------------------------------------------

// --- Dropdown langue ---
const langDropdown = document.getElementById('lang-dropdown');
const langTrigger = document.getElementById('lang-trigger');
const langMenu = document.getElementById('lang-menu');
const langLabel = document.getElementById('lang-label');
const langOptions = langMenu.querySelectorAll('.lang-option');

// ouvrir/fermer
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

// état actif + persist
function setLang(lang) {
    // styles actifs
    langOptions.forEach(btn => {
        const isActive = btn.dataset.lang === lang;
        btn.classList.toggle('bg-indigo-500/10', isActive);
        btn.classList.toggle('dark:bg-indigo-500/15', isActive);
    });

    // label + flag
    if (lang === 'fr') {
        langLabel.textContent = 'Français';
    } else {
        langLabel.textContent = 'English';
    }

    // persistance

    // ici tu peux déclencher ta logique i18n si besoin
    // updateUIToLanguage(lang)
}

// choix option
langOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        setLang(btn.dataset.lang);
        langMenu.classList.add('hidden');
    });
});

//------------------------------------------------------------------------------------------------

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

//------------------------------------------------------------------------------------------------

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
    localStorage.setItem('action', actionKey);

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
setAction(localStorage.getItem('action') || 'follow');


//----------------------------------------------------------------------------------------------------------------

const toggleBtn = document.getElementById('select-toggle');
const iconSelect = toggleBtn.querySelector('.icon-select');
const iconUncheck = toggleBtn.querySelector('.icon-uncheck');
const label = toggleBtn.querySelector('.label');

toggleBtn.addEventListener('click', () => {
    const isSelect = toggleBtn.dataset.state !== 'uncheck'; // état actuel

    // bascule icônes
    iconSelect.classList.toggle('hidden', isSelect);   // cacher si on passe à uncheck
    iconUncheck.classList.toggle('hidden', !isSelect); // montrer si uncheck

    // label
    label.textContent = isSelect ? 'unselect all' : 'select all';

    // état ARIA + dataset
    toggleBtn.dataset.state = isSelect ? 'uncheck' : 'select';
    toggleBtn.setAttribute('aria-pressed', String(isSelect));
});
