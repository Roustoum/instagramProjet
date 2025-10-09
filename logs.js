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

// test dark mode 
const logo = document.getElementById('logo');
logo.onclick = () => {
    if (document.documentElement.classList.contains("dark"))
        document.documentElement.classList.remove("dark")
    else {
        document.documentElement.classList.add("dark")
    }

}