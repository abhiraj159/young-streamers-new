"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";
import { Group, Message, User } from "@/types/global";
import { IoSend } from "react-icons/io5";
import { format } from "date-fns";

interface GroupChatProps {
  currentUser: User;
  selectedGroup: Group;
}

const GroupChat: React.FC<GroupChatProps> = ({
  currentUser,
  selectedGroup,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedGroup) return;

    const q = query(
      collection(firestore, "groupMessages"),
      where("groupId", "==", selectedGroup.id),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(messageData);
    });

    return () => unsubscribe();
  }, [selectedGroup]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(firestore, "groupMessages"), {
      groupId: selectedGroup.id,
      senderId: currentUser.uid,
      senderName: currentUser.name,
      text: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-gray-200 border-b">
        <h2 className="text-lg font-semibold">{selectedGroup.name}</h2>
        <p className="text-xs text-gray-600">
          Members: {selectedGroup.members.length}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-3 flex ${
                msg.senderId === currentUser.uid
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`p-3 max-w-xs rounded-lg ${
                  msg.senderId === currentUser.uid
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <p className="font-semibold">{msg.senderName}</p>
                <p>{msg.text}</p>
                <span className="text-xs text-gray-600 block text-right">
                  {format(msg.timestamp?.toDate(), "hh:mm a")}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Box */}
      <div className="p-4 border-t flex items-center">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 border rounded-lg focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 text-white p-2 rounded-lg"
        >
          <IoSend size={24} />
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
