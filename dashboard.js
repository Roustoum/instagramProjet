
document.getElementById("logs-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('logs.html');
}
document.getElementById("settings-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('settings.html');
}
document.getElementById("audiences-button").onclick = () => {
    window.location.href = chrome.runtime.getURL('audiences.html');
}

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

document.querySelectorAll('.new-campaign').forEach(btn => {
    btn.onclick = async () => {
        await chrome.tabs.create({ url: 'https://www.instagram.com/' });
    };
});

const logo = document.getElementById('logo');
logo.onclick = () => {
    if (document.documentElement.classList.contains("dark"))
        document.documentElement.classList.remove("dark")
    else {
        document.documentElement.classList.add("dark")
    }

}