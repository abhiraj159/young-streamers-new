"use client";

import React, { useState } from "react";
import { firestore } from "@/lib/firebaseConfig";
import Image from "next/image";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { User } from "@/types/global";

interface GroupCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const GroupCreationModal: React.FC<GroupCreationModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const searchUsers = async () => {
    const usersRef = collection(firestore, "users");
    const q = query(
      usersRef,
      where("name", ">=", searchQuery),
      where("name", "<=", searchQuery + "\uf8ff")
    );
    const snapshot = await getDocs(q);
    const usersData = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as User)
    );
    setUsers(usersData);
  };

  const addUserToGroup = (user: User) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const createGroup = async () => {
    if (!groupName || selectedUsers.length === 0) return;

    const groupRef = collection(firestore, "groups");
    await addDoc(groupRef, {
      name: groupName,
      adminId: user.uid,
      members: [user.uid, ...selectedUsers.map((u) => u.id)],
      createdAt: serverTimestamp(),
    });

    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-bold mb-4">Create Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="text"
          placeholder="Search Users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={searchUsers}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="mb-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => addUserToGroup(user)}
            >
              <Image
                src={user.profileImage || "/default-avatar.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
              <p className="ml-2">{user.name}</p>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <h3 className="font-semibold">Selected Users:</h3>
          {selectedUsers.map((user) => (
            <div key={user.id} className="flex items-center p-2">
              <Image
                src={user.profileImage || "/default-avatar.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
              <p className="ml-2">{user.name}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={createGroup}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCreationModal;
