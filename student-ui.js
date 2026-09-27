// --- Geolocation Helper (High Accuracy) ---
function getCoordinates() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve("Location Not Supported");
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lng = position.coords.longitude.toFixed(6);
                    const latDir = lat >= 0 ? 'N' : 'S';
                    const lngDir = lng >= 0 ? 'E' : 'W';
                    resolve(`${Math.abs(lat)}° ${latDir}, ${Math.abs(lng)}° ${lngDir}`);
                },
                (error) => {
                    console.warn("Geolocation Error:", error.message);
                    resolve("Location Denied/Unavailable");
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    });
}

// --- Date & Time Formatters ---
function getCurrentFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getCurrentFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
}

// Enforce Title Case formatting
function toTitleCase(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// --- UI Helpers ---
function showMessage(text, type = "success") {
    const msgBox = document.getElementById('message-box');
    const msgText = document.getElementById('message-text');
    const msgIcon = document.getElementById('message-icon');
    
    msgText.innerText = text;
    
    if (type === "success") {
        msgIcon.className = "fa-solid fa-circle-check text-green-400 text-xl";
        msgBox.className = "fixed top-4 left-1/2 transform -translate-x-1/2 translate-y-0 opacity-100 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-500 z-50 flex items-center gap-3 w-[90%] max-w-sm pointer-events-none";
    } else {
        msgIcon.className = "fa-solid fa-circle-exclamation text-red-400 text-xl";
        msgBox.className = "fixed top-4 left-1/2 transform -translate-x-1/2 translate-y-0 opacity-100 bg-red-900 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-500 z-50 flex items-center gap-3 w-[90%] max-w-sm pointer-events-none";
    }

    setTimeout(() => {
        msgBox.classList.remove('translate-y-0', 'opacity-100');
        msgBox.classList.add('-translate-y-24', 'opacity-0');
    }, 4000);
}

function setLoadingState(isLoading) {
    const btn = document.getElementById('submit-btn');
    const text = document.getElementById('btn-text');
    const spinner = document.getElementById('btn-spinner');
    
    if (isLoading) {
        btn.disabled = true;
        btn.classList.add('opacity-80', 'cursor-not-allowed');
        text.innerText = "Acquiring GPS Lock...";
        spinner.style.display = "block";
    } else {
        btn.disabled = false;
        btn.classList.remove('opacity-80', 'cursor-not-allowed');
        text.innerText = "Clock In Now";
        spinner.style.display = "none";
    }
}

// Expose functions to global scope for use in the app module
window.getCoordinates = getCoordinates;
window.getCurrentFormattedDate = getCurrentFormattedDate;
window.getCurrentFormattedTime = getCurrentFormattedTime;
window.toTitleCase = toTitleCase;
window.showMessage = showMessage;
window.setLoadingState = setLoadingState;