import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDk9ILzV-Yb8RZ7itsFM07yXCsO9JJAR_A",
  authDomain: "ai4-impact-food.firebaseapp.com",
  databaseURL: "https://ai4-impact-food-default-rtdb.firebaseio.com",
  projectId: "ai4-impact-food",
  storageBucket: "ai4-impact-food.firebasestorage.app",
  messagingSenderId: "736554909334",
  appId: "1:736554909334:web:aae52cf1e9a9cdad270cb7",
  measurementId: "G-ZYKDH190TL"
};

const app = initializeApp(firebaseConfig);

export const auth = typeof window === "undefined"
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
