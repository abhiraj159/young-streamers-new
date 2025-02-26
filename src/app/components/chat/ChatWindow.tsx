// young-streamers/src/app/components/chat/ChatWindow.tsx

"use client";
import React, { useState } from "react";
import Image from "next/image";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { ChatWindowProps } from "@/types/global";

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedChat,
  messages,
  message,
  setMessage, // Destructure setMessage from props
  sendMessage,
  handleInputChange,
  handleMessageOptions,
  selectedMessageId,
  copyMessage,
  deleteMessage,
  currentUser,
  isMenuOpen,
  setIsMenuOpen,
  toggleBlockUser,
  deleteChat,
}) => {
  return (
    <div className="w-3/4 flex flex-col">
      <div className="flex justify-between border-b border-t px-4">
        <div className="p-4 font-bold flex items-center gap-2">
          {selectedChat ? (
            <>
              <Image
                src={selectedChat.profileImage || "/ak.jpg"}
                width={30}
                height={30}
                className="rounded-full"
                alt="Profile"
              />
              <span>{selectedChat.senderName}</span>
              <span
                className={`text-sm ${
                  selectedChat.online ? "text-green-500" : "text-gray-500"
                }`}
              >
                {selectedChat.online ? "Online" : "Offline"}
              </span>
              {selectedChat?.id && selectedChat.typing?.[selectedChat.id] && (
                <p className="text-xs text-gray-500">Typing...</p>
              )}
            </>
          ) : (
            "Select a chat"
          )}
        </div>
        <div className="relative flex">
          <button className="px-3" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg
              viewBox="0 0 24 24"
              height="24"
              width="24"
              preserveAspectRatio="xMidYMid meet"
              className=""
              version="1.1"
              x="0px"
              y="0px"
              enableBackground="new 0 0 24 24"
            >
              <title>menu</title>
              <path
                fill="currentColor"
                d="M12,7c1.104,0,2-0.896,2-2c0-1.105-0.895-2-2-2c-1.104,0-2,0.894-2,2 C10,6.105,10.895,7,12,7z M12,9c-1.104,0-2,0.894-2,2c0,1.104,0.895,2,2,2c1.104,0,2-0.896,2-2C13.999,9.895,13.104,9,12,9z M12,15 c-1.104,0-2,0.894-2,2c0,1.104,0.895,2,2,2c1.104,0,2-0.896,2-2C13.999,15.894,13.104,15,12,15z"
              ></path>
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute top-[70%] right-[50%] bg-white border shadow-md p-2 rounded-md z-50">
              <button
                className="block w-full p-2 hover:bg-gray-100 text-xs whitespace-nowrap"
                onClick={toggleBlockUser}
              >
                {selectedChat?.blocked ? "Unblock User" : "Block User"}
              </button>
              <button
                onClick={deleteChat}
                className="block w-full p-2 hover:bg-gray-100 text-xs whitespace-nowrap"
              >
                Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="py-2">
            <div
              className={`flex ${
                msg.senderId === currentUser?.uid
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`relative rounded-lg ${
                  msg.senderId === currentUser?.uid
                    ? "bg-blue-500 text-white ps-2 pe-8"
                    : "bg-gray-200 text-black ps-2 pe-8"
                }`}
              >
                <div className="p-4 pt-2 ps-2 max-w-xs md:max-w-md pe-8">
                  {msg.text}
                  <span
                    className={`block text-xs mt-1 absolute bottom-0 ${
                      msg.senderId === currentUser?.uid
                        ? "text-[#ffffff7a] text-end right-0"
                        : "text-[#848790] right-0"
                    }`}
                  >
                    {msg.timestamp?.toDate
                      ? msg.timestamp.toDate().toLocaleTimeString()
                      : "Just now"}
                    <span className="ms-1">
                      {msg.status === "seen"
                        ? "✔✔"
                        : msg.status === "delivered"
                        ? "✔"
                        : ""}
                    </span>
                  </span>
                  <button
                    className="absolute top-0 right-0 p-1"
                    onClick={() => handleMessageOptions(msg.id)}
                  >
                    <IoIosArrowDown />
                  </button>
                  {selectedMessageId === msg.id && (
                    <div className="absolute right-0 top-6 bg-white border shadow-md p-2 rounded-md z-50">
                      <button
                        className="block w-full p-2 hover:bg-gray-100 text-xs text-black text-start"
                        onClick={() => copyMessage(msg.text)}
                      >
                        Copy
                      </button>
                      <button
                        className="block w-full p-2 hover:bg-gray-100 text-xs text-black text-start"
                        onClick={() => deleteMessage(msg.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex items-center p-4">
        <BsEmojiSmile size={24} className="mr-2 cursor-pointer" />
        <div className="relative flex items-center space-x-4 mt-4 w-full">
          <input
            type="text"
            className="flex-1 p-4 border rounded-full w-full focus-visible:outline-none"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value); // Use setMessage here
              handleInputChange(e);
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="absolute right-[10px] top-[15%] ml-2 p-2 text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-full"
            onClick={sendMessage}
          >
            <IoSend size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
