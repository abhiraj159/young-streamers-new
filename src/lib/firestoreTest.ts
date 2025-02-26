import { firestore } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const addTestMessage = async () => {
  try {
    await addDoc(collection(firestore, "messages"), {
      senderId: "test_user_1",
      receiverId: "test_user_2",
      text: "Testing Firestore Emulator!",
      timestamp: serverTimestamp(),
    });
    console.log("✅ Test message added successfully!");
  } catch (error) {
    console.error("❌ Error adding test message:", error);
  }
};
