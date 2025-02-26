import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { firestore, auth } from "@/lib/firebaseConfig";
import { ChatMessage, User } from "@/types/global";

/**
 * useChat Hook - Handles chat-related Firestore operations
 */
const useChat = (chatId: string, isGroup: boolean = false) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUser = auth.currentUser;

  /**
   * Fetches chat messages between current user and selected user
   */
  const fetchMessages = (receiverId: string) => {
    if (!currentUser) return;

    setLoading(true);
    const messagesRef = collection(firestore, "messages");
    const q = query(
      messagesRef,
      where("senderId", "in", [currentUser.uid, receiverId]),
      where("receiverId", "in", [currentUser.uid, receiverId]),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      setMessages(loadedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  /**
   * Sends a new message
   */
  const sendMessage = async (
    receiverId: string,
    text: string,
    mediaUrl?: string
  ) => {
    if (!currentUser) return;

    const messageData: Partial<ChatMessage> = {
      senderId: currentUser.uid,
      receiverId,
      text,
      mediaUrl: mediaUrl || null,
      timestamp: serverTimestamp(),
      status: "sent",
    };

    await addDoc(collection(firestore, "messages"), messageData);

    // Update chat history
    await updateChatHistory(currentUser.uid, receiverId, text);
    await updateChatHistory(receiverId, currentUser.uid, text);
  };

  /**
   * Deletes a message (only sender can delete)
   */
  const deleteMessage = async (messageId: string) => {
    if (!currentUser) return;

    const messageRef = doc(firestore, "messages", messageId);
    await deleteDoc(messageRef);
  };

  /**
   * Updates chat history
   */
  const updateChatHistory = async (
    userId: string,
    receiverId: string,
    lastMessage: string
  ) => {
    const chatHistoryRef = doc(firestore, "chatHistory", userId);
    const chatHistorySnap = await getDoc(chatHistoryRef);

    if (chatHistorySnap.exists()) {
      const existingChats = chatHistorySnap.data().chats || [];
      const updatedChats = existingChats.filter(
        (chat: any) => chat.receiverId !== receiverId
      );
      updatedChats.unshift({
        receiverId,
        lastMessage,
        timestamp: serverTimestamp(),
        unreadCount: 0,
      });

      await updateDoc(chatHistoryRef, { chats: updatedChats });
    } else {
      await setDoc(chatHistoryRef, {
        chats: [
          {
            receiverId,
            lastMessage,
            timestamp: serverTimestamp(),
            unreadCount: 0,
          },
        ],
      });
    }
  };

  return {
    messages,
    loading,
    fetchMessages,
    sendMessage,
    deleteMessage,
  };
};

export default useChat;
