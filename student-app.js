import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDVqMmPMCDX5JFb85kTlfm6fCk8cNKciH4",
    authDomain: "ait-attendance-20bb6.firebaseapp.com",
    projectId: "ait-attendance-20bb6",
    storageBucket: "ait-attendance-20bb6.firebasestorage.app",
    messagingSenderId: "262056210376",
    appId: "1:262056210376:web:c8a7260a8491f932a69afd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Local Storage Auto-Fill ---
window.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('ait_student_name');
    const savedId = localStorage.getItem('ait_student_id');
    const savedLevel = localStorage.getItem('ait_student_level');
    const savedStream = localStorage.getItem('ait_student_stream');

    if (savedName) document.getElementById('student-name').value = savedName;
    if (savedId) document.getElementById('student-id').value = savedId;
    if (savedLevel) document.getElementById('student-level').value = savedLevel;
    if (savedStream) document.getElementById('student-stream').value = savedStream;
});

// --- Form Submission ---
document.getElementById('clockin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const rawName = document.getElementById('student-name').value.trim();
    const studentId = document.getElementById('student-id').value.trim().toUpperCase();
    const level = document.getElementById('student-level').value;
    const stream = document.getElementById('student-stream').value;
    const courseCode = document.getElementById('course-code').value.trim().toUpperCase();
    const rawCourseName = document.getElementById('course-name').value.trim();

    if (!courseCode || !rawCourseName) {
        window.showMessage("Please enter both the course code and name.", "error");
        return;
    }
    
    window.setLoadingState(true);

    try {
        const gpsCoordinates = await window.getCoordinates();
        const currentDate = window.getCurrentFormattedDate();
        const currentTime = window.getCurrentFormattedTime();
        
        // Title Case formatting before database injection
        const formattedName = window.toTitleCase(rawName);
        const formattedCourseName = window.toTitleCase(rawCourseName);

        const attendanceData = {
            name: formattedName,
            studentId: studentId,
            level: level,
            stream: stream,
            courseCode: courseCode,
            courseName: formattedCourseName,
            date: currentDate,
            time: currentTime,
            gps: gpsCoordinates,
            status: 'present',
            timestamp: new Date().getTime() 
        };

        await addDoc(collection(db, "student_attendance"), attendanceData);

        // Save details for next time
        localStorage.setItem('ait_student_name', formattedName);
        localStorage.setItem('ait_student_id', studentId);
        localStorage.setItem('ait_student_level', level);
        localStorage.setItem('ait_student_stream', stream);

        window.showMessage(`Success! Clocked in for ${courseCode}.`);
        
        document.getElementById('course-code').value = "";
        document.getElementById('course-name').value = "";
        
    } catch (error) {
        console.error("Submission error:", error);
        window.showMessage("Failed to submit attendance. Please check your connection.", "error");
    } finally {
        window.setLoadingState(false);
    }
});

// --- PWA Auto-Update Logic ---
function initPWA() {
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        installBtn.classList.add('hidden');
    });

    window.addEventListener('appinstalled', () => {
        installBtn.classList.add('hidden');
        deferredPrompt = null;
    });

    if ('serviceWorker' in navigator) {
        let isRefreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => { 
            if (!isRefreshing) { isRefreshing = true; window.location.reload(); } 
        });

        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                registration.update();
                
                document.addEventListener('visibilitychange', () => { 
                    if (document.visibilityState === 'visible') registration.update(); 
                });
                
                setInterval(() => registration.update(), 30 * 60 * 1000);
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing; 
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => { 
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' }); 
                        }
                    });
                });
            } catch (err) { console.error('SW error:', err); }
        });
    }
}

initPWA();