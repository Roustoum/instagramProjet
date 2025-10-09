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