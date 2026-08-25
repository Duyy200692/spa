import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Thay thế các giá trị bên dưới bằng thông tin từ Firebase Console của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAS9G31URd2WN3qzOy74IMr8qH0VItjgB0",
  authDomain: "juspa-manager.firebaseapp.com",
  projectId: "juspa-manager",
  storageBucket: "juspa-manager.firebasestorage.app",
  messagingSenderId: "457281875952",
  appId: "1:457281875952:web:504941230227ba7a007735"
};

// Khởi tạo Firebase
// Initialize using compat API which is more robust against environment type resolution issues
// Khởi tạo Firebase theo chuẩn Modular SDK (Mới nhất)
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);