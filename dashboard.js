// Sélection des boutons et sections
const buttons = document.querySelectorAll('button[id$="-button"]');
const sections = document.querySelectorAll('div[id$="-content"]');

// Fonction pour gérer le toggle
buttons.forEach((button) => {
    button.addEventListener('click', () => {
        // Retirer le style actif de tous les boutons
        buttons.forEach((btn) => {
            btn.classList.remove('bg-indigo-400/20', 'hover:bg-indigo-400/40');
            btn.classList.add('hover:bg-indigo-400/10');
            btn.querySelector('p').classList.remove('text-indigo-700', 'group-hover:text-indigo-900');
            btn.querySelector('p').classList.add('text-black', 'group-hover:text-indigo-500');
            btn.querySelector('svg').classList.remove('stroke-indigo-700', 'group-hover:stroke-indigo-900');
            btn.querySelector('svg').classList.add('stroke-black', 'group-hover:stroke-indigo-500');
        });

        // Cacher toutes les sections
        sections.forEach((section) => section.classList.add('hidden'));

        // Activer le bouton et la section cliquée
        const sectionId = button.id.replace('-button', '-content');
        document.getElementById(sectionId).classList.remove('hidden');

        // Toggle des classes Tailwind pour l’effet actif
        button.classList.toggle('bg-indigo-400/20');
        button.classList.toggle('hover:bg-indigo-400/40');
        button.classList.toggle('hover:bg-indigo-400/10');
        const p = button.querySelector('p');
        const svg = button.querySelector('svg');
        p.classList.toggle('text-indigo-700');
        p.classList.toggle('text-black');
        svg.classList.toggle('stroke-indigo-700');
        svg.classList.toggle('stroke-black');
    });
});