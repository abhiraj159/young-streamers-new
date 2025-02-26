// young-streamers/src/app/components/chat/LeftSidebar.tsx

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import CreateGroup from "../group/CreateGroup";
import { ChatData } from "@/types/global";
import { auth, firestore } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface LeftSideBarProps {
  chats: ChatData[];
  setSelectedChat: (chat: ChatData) => void;
  currentUser: any;
}

const LeftSideBar: React.FC<LeftSideBarProps> = ({
  chats,
  setSelectedChat,
  currentUser,
}) => {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Fetch blocked users list
  useEffect(() => {
    if (!currentUser) return;

    const fetchBlockedUsers = async () => {
      const userDocRef = doc(firestore, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      const blockedUsersList = userSnap.data()?.blockedUsers || [];
      setBlockedUsers(blockedUsersList);
    };

    fetchBlockedUsers();
  }, [currentUser]);

  // Filter chats to exclude blocked users
  const filteredChats = chats
    .filter((chat) => {
      const isSenderBlocked = blockedUsers.includes(chat.senderId);
      const isReceiverBlocked = blockedUsers.includes(chat.receiverId);
      return !isSenderBlocked && !isReceiverBlocked;
    })
    .map((chat) => {
      // Filter lastMessage for blocked users
      const isLastMessageFromBlockedUser = blockedUsers.includes(chat.senderId);
      return {
        ...chat,
        lastMessage: isLastMessageFromBlockedUser ? "" : chat.lastMessage,
      };
    });

  return (
    <div className="w-1/4 border-r border-t p-4 overflow-y-auto">
      <div className="flex justify-between">
        <h3 className="font-bold text-2xl">Chats</h3>
        <button
          className="bg-blue-500 text-white px-4 rounded-full"
          onClick={() => setIsCreateGroupOpen(true)}
        >
          ⋮
        </button>
      </div>
      {isCreateGroupOpen && (
        <CreateGroup
          onClose={() => setIsCreateGroupOpen(false)}
          onGroupCreated={() => console.log("Group Created Successfully")}
        />
      )}
      {filteredChats.map((chat) => (
        <div
          key={chat.id}
          className="p-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100 rounded-lg"
          onClick={() => setSelectedChat(chat)}
        >
          <Image
            src={chat.profileImage ?? "/default-avatar.png"}
            width={40}
            height={40}
            className="rounded-full"
            alt="Profile"
          />
          <div>
            <p className="font-bold">{chat.senderName}</p>
            <p className="text-sm text-gray-500">{chat.lastMessage}</p>
          </div>
          {chat.unreadCount ? (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {chat.unreadCount}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default LeftSideBar;
