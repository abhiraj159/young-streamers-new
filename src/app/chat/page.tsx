//young-streamers/src/app/chat/page.tsx

"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, firestore } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  setDoc,
} from "firebase/firestore";
import MenuBar from "@/app/components/MenuBar";
import LeftSideBar from "@/app/components/chat/LeftSidebar";
import ChatWindow from "@/app/components/chat/ChatWindow";
import { ChatData, Message } from "@/types/global";

const ChatPage: React.FC = () => {
  const router = useRouter();
  const [chats, setChats] = useState<ChatData[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const searchParams = useSearchParams();
  const userIdFromParams = searchParams.get("userId");
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(firestore, "messages"),
      where("senderId", "==", currentUser.uid),
      orderBy("timestamp", "asc")
    );

    const q2 = query(
      collection(firestore, "messages"),
      where("receiverId", "==", currentUser.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe1 = onSnapshot(q, async (snapshot) => {
      const chatMap = new Map<string, ChatData>();

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const chatPartnerId = data.receiverId;

        if (!chatMap.has(chatPartnerId)) {
          const userDoc = await getDoc(doc(firestore, "users", chatPartnerId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            chatMap.set(chatPartnerId, {
              id: chatPartnerId,
              senderId: data.senderId,
              receiverId: data.receiverId,
              senderName: userData.name,
              profileImage: userData.profileImage || "/default-avatar.png",
              lastMessage: data.text,
              unreadCount: 0,
              online: userData.online || false,
              typing: userData.typing || {},
            });
          }
        } else {
          const existingChat = chatMap.get(chatPartnerId);
          if (existingChat) {
            existingChat.lastMessage = data.text;
          }
        }
      }

      const newChats = Array.from(chatMap.values());
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        newChats.forEach((newChat) => {
          const existingChatIndex = updatedChats.findIndex(
            (chat) => chat.id === newChat.id
          );
          if (existingChatIndex !== -1) {
            updatedChats[existingChatIndex] = newChat;
          } else {
            updatedChats.push(newChat);
          }
        });
        return updatedChats;
      });
    });

    const unsubscribe2 = onSnapshot(q2, async (snapshot) => {
      const chatMap = new Map<string, ChatData>();

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const chatPartnerId = data.senderId;

        if (!chatMap.has(chatPartnerId)) {
          const userDoc = await getDoc(doc(firestore, "users", chatPartnerId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            chatMap.set(chatPartnerId, {
              id: chatPartnerId,
              senderId: data.senderId,
              receiverId: data.receiverId,
              senderName: userData.name,
              profileImage: userData.profileImage || "/default-avatar.png",
              lastMessage: data.text,
              unreadCount: 0,
              online: userData.online || false,
              typing: userData.typing || {},
            });
          }
        } else {
          const existingChat = chatMap.get(chatPartnerId);
          if (existingChat) {
            existingChat.lastMessage = data.text;
          }
        }
      }

      const newChats = Array.from(chatMap.values());
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        newChats.forEach((newChat) => {
          const existingChatIndex = updatedChats.findIndex(
            (chat) => chat.id === newChat.id
          );
          if (existingChatIndex !== -1) {
            updatedChats[existingChatIndex] = newChat;
          } else {
            updatedChats.push(newChat);
          }
        });
        return updatedChats;
      });
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!userIdFromParams || !currentUser) return;

    const fetchUserDetails = async () => {
      const userRef = doc(firestore, "users", userIdFromParams);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newChat: ChatData = {
          id: userIdFromParams,
          senderId: currentUser.uid,
          receiverId: userIdFromParams,
          senderName: userData.name,
          profileImage: userData.profileImage || "/default-avatar.png",
          lastMessage: "",
          unreadCount: 0,
          online: userData.online || false,
          typing: userData.typing || false,
        };

        setSelectedChat(newChat);

        // Update the chats list
        setChats((prevChats) => {
          const isAlreadyInList = prevChats.some(
            (chat) => chat.id === userIdFromParams
          );
          // If the chat is already in the list, return the previous chats
          if (isAlreadyInList) {
            return prevChats;
          }
          return [newChat, ...prevChats];
        });
        router.replace("/chat");
      }
    };

    fetchUserDetails();
  }, [userIdFromParams, currentUser]);

  // Toggle block/unblock user function
  const toggleBlockUser = async () => {
    if (!currentUser || !selectedChat) return;

    const userDocRef = doc(firestore, "users", currentUser.uid);
    const userSnap = await getDoc(userDocRef);
    const blockedUsers = userSnap.data()?.blockedUsers || [];

    const isBlocked = blockedUsers.includes(selectedChat.id);

    // blocked users list
    await updateDoc(userDocRef, {
      blockedUsers: isBlocked
        ? arrayRemove(selectedChat.id)
        : arrayUnion(selectedChat.id),
    });

    // Send system message to the blocked user
    if (!isBlocked) {
      try {
        await addDoc(collection(firestore, "messages"), {
          senderId: "system",
          receiverId: selectedChat.id,
          text: `You have been blocked by ${
            currentUser.displayName || "a user"
          }.`,
          timestamp: serverTimestamp(),
          status: "sent",
        });
      } catch (error) {
        console.error("Error sending message: ", error);
        alert("Failed to send message. Please try again.");
      }
    }

    // Update selectedChat state
    setSelectedChat((prev) => ({
      ...prev!,
      blocked: !isBlocked,
    }));

    // Show notification to the current user
    if (!isBlocked) {
      alert(`You have blocked ${selectedChat.senderName}.`);
    } else {
      alert(`You have unblocked ${selectedChat.senderName}.`);
    }
  };

  useEffect(() => {
    if (!selectedChat?.id || !currentUser?.uid) return;

    const q = query(
      collection(firestore, "messages"),
      where("receiverId", "in", [selectedChat.id, currentUser.uid]),
      where("senderId", "in", [selectedChat.id, currentUser.uid]),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        senderId: doc.data().senderId,
        receiverId: doc.data().receiverId,
        text: doc.data().text,
        timestamp: doc.data().timestamp,
        status: doc.data().status,
      })) as Message[];

      // Filter out messages if the user is blocked
      const userDocRef = doc(firestore, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      const blockedUsers = userSnap.data()?.blockedUsers || [];

      // Filter messages based on block status
      const filteredMsgs = msgs.filter((msg) => {
        const isSenderBlocked = blockedUsers.includes(msg.senderId);
        const isReceiverBlocked = blockedUsers.includes(msg.receiverId);

        // If the message is from a blocked user or to a blocked user, hide it
        if (isSenderBlocked || isReceiverBlocked) {
          return false;
        }
        return true;
      });

      // Update the messages state
      setMessages(filteredMsgs);

      // Mark messages as seen
      const batchUpdate = snapshot.docs.map(async (docSnap) => {
        const messageData = docSnap.data();

        if (messageData.status !== "seen") {
          const docRef = doc(firestore, "messages", docSnap.id);
          await updateDoc(docRef, { status: "delivered" });
        }
      });

      try {
        await Promise.all(batchUpdate);
        console.log("All message statuses updated successfully.");
      } catch (error) {
        console.error("Error updating message status: ", error);
      }
    });

    return () => unsubscribe();
  }, [selectedChat, currentUser]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat || !currentUser) return;

    // Check if the user is blocked
    const userDocRef = doc(firestore, "users", currentUser.uid);
    const userSnap = await getDoc(userDocRef);
    const blockedUsers = userSnap.data()?.blockedUsers || [];

    if (blockedUsers.includes(selectedChat.id)) {
      alert(
        `You have blocked ${selectedChat.senderName}. Messages will not be delivered.`
      );
      return;
    }

    try {
      // Add the message to Firestore
      await addDoc(collection(firestore, "messages"), {
        senderId: currentUser.uid,
        receiverId: selectedChat.id,
        text: message,
        timestamp: serverTimestamp(),
        status: "sent",
      });

      // Check if the chat already exists in the chats list
      const chatExists = chats.some((chat) => chat.id === selectedChat.id);

      // If the chat doesn't exist, add it to the chats list
      if (!chatExists) {
        const userRef = doc(firestore, "users", selectedChat.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const newChat: ChatData = {
            id: selectedChat.id,
            senderId: currentUser.uid,
            receiverId: selectedChat.id,
            senderName: userData.name,
            profileImage: userData.profileImage || "/default-avatar.png",
            lastMessage: message,
            unreadCount: 0,
            online: userData.online || false,
            typing: userData.typing || false,
          };

          // Update the chats list
          setChats((prevChats) => [newChat, ...prevChats]);
        }
      }

      setMessage(""); // Clear the input field after sending the message
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!currentUser || !selectedChat) return;

    const chatDocRef = doc(
      firestore,
      "chats",
      `${currentUser.uid}_${selectedChat.id}`
    );
    const chatDocSnap = await getDoc(chatDocRef);

    if (!chatDocSnap.exists()) {
      await setDoc(chatDocRef, { typing: { [currentUser.uid]: isTyping } });
    } else {
      await updateDoc(chatDocRef, { [`typing.${currentUser.uid}`]: isTyping });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    updateTypingStatus(true);

    setTimeout(() => updateTypingStatus(false), 1500);
  };

  const deleteMessage = async (messageId: string) => {
    await deleteDoc(doc(firestore, "messages", messageId));
  };

  // Delete message one by one
  const deleteChat = async () => {
    if (!currentUser || !selectedChat) return;

    const q = query(
      collection(firestore, "messages"),
      where("receiverId", "in", [selectedChat.id, currentUser.uid]),
      where("senderId", "in", [selectedChat.id, currentUser.uid]),
      orderBy("timestamp", "asc")
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    setChats((prevChats) =>
      prevChats.filter((chat) => chat.id !== selectedChat.id)
    );
    setSelectedChat(null);
  };

  const handleMessageOptions = (messageId: string) => {
    setSelectedMessageId(messageId === selectedMessageId ? null : messageId);
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setSelectedMessageId(null);
  };

  return (
    <>
      <MenuBar />
      <div className="flex h-[83vh]">
        {/* Chat List */}
        <LeftSideBar
          chats={chats}
          setSelectedChat={setSelectedChat}
          currentUser={currentUser}
        />

        {/* Chat Window */}
        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          handleInputChange={handleInputChange}
          handleMessageOptions={handleMessageOptions}
          selectedMessageId={selectedMessageId}
          copyMessage={copyMessage}
          deleteMessage={deleteMessage}
          currentUser={currentUser}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          toggleBlockUser={toggleBlockUser}
          deleteChat={deleteChat}
        />
      </div>
    </>
  );
};

export default ChatPage;
