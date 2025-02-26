// young-streamers/src/types/global.d.ts

declare global {
  interface Window {
    recaptchaVerifier: any; // Declare recaptchaVerifier as a global property
    confirmationResult: any; // Declare confirmationResult as a global property
  }
}

export interface User {
  id: string; // Add this line
  uid: string; // Unique user ID
  name: string; // User ka naam
  email: string; // Email address
  profileImage?: string; // Profile image (optional)
  onlineStatus?: "online" | "offline"; // User ka status
}

export interface ChatData {
  id: string;
  senderId: string;
  receiverId: string;
  profileImage?: string;
  senderName: string;
  lastMessage?: string;
  unreadCount?: number;
  online: boolean;
  typing: { [key: string]: boolean };
  blocked?: boolean;
}

export interface Group {
  id: string; // Group ka unique ID
  name: string; // Group ka naam
  createdBy: string; // Kis user ne create kiya (Admin UID)
  members: string[]; // Group members ki UID list
  createdAt: any; // Group ka creation timestamp
  profileImage?: string; // Group ka optional profile image
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: any;
  status: "sent" | "delivered" | "seen";
  mediaUrl?: string;
  replyTo?: string | null;
}

export interface ChatWindowProps {
  selectedChat: ChatData | null;
  messages: Message[];
  message: string;
  setMessage: (message: string) => void; // Add setMessage to props
  sendMessage: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMessageOptions: (messageId: string) => void;
  selectedMessageId: string | null;
  copyMessage: (text: string) => void;
  deleteMessage: (messageId: string) => void;
  currentUser: any;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  toggleBlockUser: () => void;
  deleteChat: () => void;
}
export {}; // Global type definitions ko preserve karne ke liye
