import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../../lib/firebaseConfig";

// Function to request permission and get token
export const requestNotificationPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // Add this in your `.env.local`
    });
    if (token) {
      console.log("Notification Token: ", token);
      return token;
    } else {
      console.warn("No notification token received");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission: ", error);
    return null;
  }
};

// Listener for incoming notifications
export const onNotificationListener = (callback: (payload: any) => void) => {
  onMessage(messaging, (payload) => {
    console.log("Notification received: ", payload);
    callback(payload);
  });
};
