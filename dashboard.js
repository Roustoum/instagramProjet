// dashboard.js

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

const logo = document.getElementById('logo');
logo.onclick = ()=>{
    if(document.documentElement.classList.contains("dark"))
        document.documentElement.classList.remove("dark")
    else{
        document.documentElement.classList.add("dark")
    }
    
}