import { firestore } from "./firebaseConfig";
import { collection, setDoc, doc, serverTimestamp } from "firebase/firestore";

const seedFirestore = async () => {
  try {
    console.log("🔥 Seeding Firestore Emulator...");

    // ✅ Debug: Firestore Connection Check
    if (!firestore) {
      console.error("❌ Firestore instance not initialized!");
      return;
    }

    // ✅ Debug: Collection Path
    const messagesCollectionRef = collection(firestore, "messages");
    console.log(
      "📌 Messages Collection Reference Created:",
      messagesCollectionRef
    );

    // ✅ Debug: Document Reference
    const messageRef = doc(messagesCollectionRef);
    console.log("📌 Document Reference Created:", messageRef);

    // ✅ Debug: Attempting to Write Data
    await setDoc(messageRef, {
      senderId: "test_user_1",
      receiverId: "test_user_2",
      text: "This is a test message!",
      status: "sent",
      timestamp: serverTimestamp(),
    });

    console.log("✅ Firestore Emulator Seeded Successfully!");
  } catch (error) {
    console.error("❌ Error seeding Firestore:", error);
  }
};

export default seedFirestore;
