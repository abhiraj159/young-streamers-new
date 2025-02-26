"use client";

import { useState, useEffect } from "react";
import { firestore } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Button from "../button";

interface User {
  uid: string;
  name: string;
  profileImage: string;
}

interface CreateGroupProps {
  onGroupCreated: () => void;
  onClose: () => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({
  onGroupCreated,
  onClose,
}) => {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers([]); // Agar search input empty ho to users list clear kar do
      return;
    }

    const fetchUsers = async () => {
      try {
        const usersRef = collection(firestore, "users");
        const q = query(
          usersRef,
          where("lowercaseName", ">=", searchQuery.toLowerCase()),
          where("lowercaseName", "<=", searchQuery.toLowerCase() + "\uf8ff")
        );

        const querySnapshot = await getDocs(q);
        const userList = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(userList);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    };

    fetchUsers();
  }, [searchQuery]); // 🔥 Har bar jab searchQuery update hoga, Firestore se data fetch hoga

  // ➕ Add user to selected list
  const addUserToGroup = (user: User) => {
    if (!selectedUsers.some((u) => u.uid === user.uid)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // ❌ Remove user from selected list
  const removeUserFromGroup = (uid: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.uid !== uid));
  };

  // 📌 Create Group and store in Firestore
  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) return;

    try {
      const groupRef = await addDoc(collection(firestore, "groups"), {
        name: groupName,
        members: selectedUsers.map((user) => user.uid),
        createdAt: serverTimestamp(),
      });

      console.log("Group Created:", groupRef.id);
      onGroupCreated(); // Notify parent component
      onClose(); // Close modal
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <button className="text-lg font-semibold mb-3">Create Group</button>

      {/* Group Name Input */}
      <input
        type="text"
        placeholder="Enter group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="w-full p-2 border-b border-gray-300 mb-3 focus-visible:outline-none"
      />

      {/* Search Users */}
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)} // 🔥 Har typing pe searchQuery update hoga
        className="w-full p-2 border-b border-gray-300 mb-3 focus-visible:outline-none"
      />

      {/* Users List */}
      <div>
        {users.map((user) => (
          <div
            key={user.uid}
            className="flex items-center justify-between p-2 border-b"
          >
            <span>{user.name}</span>
            <Button onClick={() => addUserToGroup(user)}>Add</Button>
          </div>
        ))}
      </div>

      {/* Selected Users */}
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Selected Users:</h3>
        {selectedUsers.map((user) => (
          <div
            key={user.uid}
            className="flex items-center justify-between p-2 bg-gray-100 rounded mt-2"
          >
            <span>{user.name}</span>
            <Button
              onClick={() => removeUserFromGroup(user.uid)}
              variant="destructive"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* Create Group Button */}
      <Button
        onClick={handleCreateGroup}
        className="mt-4 w-full"
        disabled={!groupName || selectedUsers.length === 0}
      >
        Create Group
      </Button>
    </div>
  );
};

export default CreateGroup;
