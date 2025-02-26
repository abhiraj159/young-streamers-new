// young-streamers/src/lib/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken } from "firebase/messaging";
import seedFirestore from "./seedFirestore";

// ✅ Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL:
    "https://young-streamers-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

// ✅ Enable Auth Persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

// ✅ Firebase Emulator Setup (Only if enabled in .env)
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  console.log("🔥 Using Firebase Emulator...");

  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(firestore, "127.0.0.1", 8085);
  connectDatabaseEmulator(db, "127.0.0.1", 9000);

  // ✅ Firestore Data Seed Karo (Auto Add Collections)
  seedFirestore();
}

// ✅ Initialize Firebase Messaging (Client-Side Only)
export let messaging: ReturnType<typeof getMessaging> | null = null;
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

// ✅ Function to get Firebase Cloud Messaging (FCM) Token
export const getFCMToken = async () => {
  try {
    if (!messaging) {
      console.warn("Firebase Messaging is not initialized.");
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return null;
    }
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    if (currentToken) {
      console.log("FCM Token:", currentToken);
      return currentToken;
    } else {
      console.warn("No FCM token available.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
    return null;
  }
};

// ✅ Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export default app;
