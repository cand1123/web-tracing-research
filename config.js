export const firebaseConfig = {
    apiKey: "AIzaSyBLgf4hShqSwN6LfiNFHs3FlQjXzs94guw",
    authDomain: "tracing-research.firebaseapp.com",
    databaseURL: "https://tracing-research-default-rtdb.firebaseio.com",
    projectId: "tracing-research",
    storageBucket: "tracing-research.appspot.com",
    messagingSenderId: "1018100569340",
    appId: "1:1018100569340:web:e25cb3e7b0b05143c13379",
    measurementId: "G-9GPNG6GSWH"
};

// Google Identity Services Client ID
export const googleClientId = "1018100569340-cgllrt48c5kvooauov1g0bjqanir51h5.apps.googleusercontent.com";

// Backward compatibility jika ada kode lama yang membaca dari window
try {
    if (typeof window !== 'undefined') {
        window.firebaseConfig = window.firebaseConfig || firebaseConfig;
        window.googleClientId = window.googleClientId || googleClientId;
    }
} catch (_) {}