// young-streamers/src/lib/userService.ts

import { firestore } from "./firebaseConfig"; // Firebase configuration import
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from "firebase/firestore"; // Import necessary methods from Firebase

// Define types for the user data and chat history
interface UserData {
  name: string;
  profileImage: string;
  email: string;
  age: string;
  country: string;
  sex: string;
}

interface ChatUser {
  userId: string;
  name: string;
  profileImage: string;
  lastMessage: string;
  timestamp: any; // Timestamp type
}

// Fetch user data (profile details)
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDocRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      console.log("User not found");
      return null;
    }
  } catch (e) {
    console.error("Error fetching user data:", e);
    return null;
  }
};

// Fetching previous chat users
export const getUserChats = async (userId: string): Promise<ChatUser[]> => {
  try {
    const messagesRef = collection(firestore, "messages");
    const q = query(
      messagesRef,
      where("senderId", "==", userId) // Filter messages where user is sender
    );
    const querySnapshot = await getDocs(q);

    const userChats: ChatUser[] = []; // Correct type

    // Using async/await with for...of loop to handle asynchronous operations
    for (const docSnapshot of querySnapshot.docs) {
      const messageData = docSnapshot.data() as DocumentData;
      const otherUserId =
        messageData.receiverId === userId
          ? messageData.senderId
          : messageData.receiverId;

      // Fetch user details for the other user in the chat
      const userDetails = await getUserData(otherUserId);
      if (userDetails) {
        userChats.push({
          userId: otherUserId,
          name: userDetails.name,
          profileImage: userDetails.profileImage,
          lastMessage: messageData.text,
          timestamp: messageData.timestamp,
        });
      }
    }

    return userChats; // Returning the list of chats
  } catch (error) {
    console.error("Error fetching user chats: ", error);
    return []; // Returning empty array on error
  }
};

// Search users by name (Search all registered users)
export const searchUsersByName = async (name: string): Promise<UserData[]> => {
  try {
    const usersRef = collection(firestore, "users");
    const lowercaseName = name.toLowerCase();
    const q = query(
      usersRef,
      where("name_lowercase", ">=", lowercaseName),
      where("name_lowercase", "<=", lowercaseName + "\uf8ff")
    );
    const querySnapshot = await getDocs(q);

    const users: UserData[] = querySnapshot.docs.map(
      (doc) => doc.data() as UserData
    );
    return users;
  } catch (error) {
    console.error("Error searching users by name:", error);
    return [];
  }
};
