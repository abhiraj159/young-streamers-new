// young-streamers/src/lib/chatService.ts
import { firestore } from "./firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  orderBy,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// Define types for messages
interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  status: string;
  timestamp: any; // Timestamp type
}

// Get list of users the current user has chatted with
export const getUserChats = async (userId: string): Promise<any[]> => {
  try {
    const sentQuery = query(
      collection(firestore, "messages"),
      where("senderId", "==", userId)
    );
    const receivedQuery = query(
      collection(firestore, "messages"),
      where("receiverId", "==", userId)
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery),
    ]);

    const users = new Set<string>();

    sentSnapshot.forEach((doc) => users.add(doc.data().receiverId));
    receivedSnapshot.forEach((doc) => users.add(doc.data().senderId));

    // Fetch user details for each user ID
    const userDetails = await Promise.all(
      Array.from(users).map(async (userId) => {
        const userDoc = await getDoc(doc(firestore, "users", userId));
        return { userId, ...userDoc.data() };
      })
    );

    return userDetails;
  } catch (e) {
    console.error("Error fetching user chats:", e);
    return [];
  }
};

// Real-time messages listener
export const listenForMessages = (
  senderId: string,
  receiverId: string,
  callback: (newMessages: Message[]) => void
) => {
  const q = query(
    collection(firestore, "messages"),
    where("senderId", "in", [senderId, receiverId]),
    where("receiverId", "in", [senderId, receiverId]),
    orderBy("timestamp")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(), // Ensure valid timestamp
      } as Message;
    });
    callback(messages);
  });

  return unsubscribe;
};

// Send message function
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  message: string
) => {
  const isBlocked = await checkIfUserBlocked(senderId, receiverId);
  if (isBlocked) {
    console.error("Cannot send message: Receiver is blocked.");
    return;
  }

  const messageData = {
    senderId,
    receiverId,
    text: message,
    status: "sent",
    timestamp: serverTimestamp(),
  };

  try {
    await addDoc(collection(firestore, "messages"), messageData);
    console.log("Message sent:", messageData);
  } catch (e) {
    console.error("Error sending message:", e);
  }
};

// Delete all messages between two users
export const deleteChat = async (userId: string, receiverId: string) => {
  const q = query(
    collection(firestore, "messages"),
    where("senderId", "in", [userId, receiverId]),
    where("receiverId", "in", [userId, receiverId])
  );

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("No messages found to delete.");
      return;
    }

    querySnapshot.forEach(async (docSnapshot) => {
      await deleteDoc(docSnapshot.ref);
    });
    console.log("Chat deleted successfully.");
  } catch (e) {
    console.error("Error deleting chat:", e);
  }
};

// Toggle block user
export const toggleBlockUser = async (userId: string, receiverId: string) => {
  const userRef = doc(firestore, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.error("User document not found.");
    return;
  }

  const blockedUsers = userDoc.data()?.blockedUsers || [];

  const updatedBlockedUsers = blockedUsers.includes(receiverId)
    ? arrayRemove(receiverId)
    : arrayUnion(receiverId);

  await updateDoc(userRef, { blockedUsers: updatedBlockedUsers });
};

// Check if user is blocked
export const checkIfUserBlocked = async (
  userId: string,
  receiverId: string
): Promise<boolean> => {
  const userRef = doc(firestore, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.error("User document not found.");
    return false;
  }

  return userDoc.data()?.blockedUsers?.includes(receiverId) || false;
};

// Toggle follow
export const toggleFollow = async (userId: string, targetId: string) => {
  const userRef = doc(firestore, "users", userId);
  const targetRef = doc(firestore, "users", targetId);

  await updateDoc(userRef, {
    following: arrayUnion(targetId),
  });
  await updateDoc(targetRef, {
    followers: arrayUnion(userId),
  });
};
