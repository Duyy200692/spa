import { initializeApp } from "firebase/app";
import { getFirestore, setLogLevel, disableNetwork } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAS9G31URd2WN3qzOy74IMr8qH0VItjgB0",
  authDomain: "juspa-manager.firebaseapp.com",
  projectId: "juspa-manager",
  storageBucket: "juspa-manager.firebasestorage.app",
  messagingSenderId: "457281875952",
  appId: "1:457281875952:web:504941230227ba7a007735"
};

// Suppress noisy internal WebChannel 10s timeout console errors when operating in local/offline mode
setLogLevel('silent');

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Default template projectId operates in fast Local Storage mode unless replaced with an active cloud project
export const IS_CLOUD_CONFIGURED = Boolean(
  firebaseConfig.projectId && firebaseConfig.projectId !== "juspa-manager"
);

if (!IS_CLOUD_CONFIGURED) {
  disableNetwork(db).catch(() => {});
}
