"use client";

import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";
import { User } from "@/types/global";

interface GroupSettingsProps {
  groupId: string;
  currentUser: User;
  closeSettings: () => void;
}

const GroupSettings: React.FC<GroupSettingsProps> = ({
  groupId,
  currentUser,
  closeSettings,
}) => {
  const [groupData, setGroupData] = useState<any>(null);
  const [newMember, setNewMember] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      const groupRef = doc(firestore, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        setGroupData(groupSnap.data());
      }
    };
    fetchGroupData();
  }, [groupId]);

  const isAdmin = groupData?.adminId === currentUser.uid;
  const isMember = groupData?.members.includes(currentUser.uid);

  // ✅ Member ko group me add karne ka function
  const addMember = async () => {
    if (!isAdmin) return alert("Only admin can add members!");
    if (!newMember) return alert("Enter a valid user ID!");

    const groupRef = doc(firestore, "groups", groupId);
    await updateDoc(groupRef, { members: arrayUnion(newMember) });

    setGroupData((prev: any) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
    setNewMember("");
  };

  // ✅ Member ko group se remove karne ka function
  const removeMember = async (userId: string) => {
    if (!isAdmin) return alert("Only admin can remove members!");

    const groupRef = doc(firestore, "groups", groupId);
    await updateDoc(groupRef, { members: arrayRemove(userId) });

    setGroupData((prev: any) => ({
      ...prev,
      members: prev.members.filter((member: string) => member !== userId),
    }));
  };

  // ✅ Group Delete karne ka function (Only Admin)
  const deleteGroup = async () => {
    if (!isAdmin) return alert("Only admin can delete the group!");

    setLoading(true);
    const groupRef = doc(firestore, "groups", groupId);
    await deleteDoc(groupRef);
    setLoading(false);

    closeSettings();
  };

  // ✅ Leave Group function (If admin leaves, transfer admin role)
  const leaveGroup = async () => {
    if (!isMember) return alert("You are not in this group!");

    const groupRef = doc(firestore, "groups", groupId);
    let updatedMembers = groupData.members.filter(
      (member: string) => member !== currentUser.uid
    );

    if (isAdmin && updatedMembers.length > 0) {
      // Admin leaves, transfer role to next member
      await updateDoc(groupRef, {
        members: updatedMembers,
        adminId: updatedMembers[0], // Next user becomes admin
      });
    } else {
      // Normal member leaves
      await updateDoc(groupRef, { members: updatedMembers });
    }

    closeSettings();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg w-[400px]">
        <h2 className="text-xl font-bold">Group Settings</h2>

        {/* ✅ Group Members List */}
        <h3 className="mt-3 text-lg font-semibold">Members</h3>
        <ul className="mt-2">
          {groupData?.members.map((member: string) => (
            <li
              key={member}
              className="flex justify-between items-center p-2 border-b"
            >
              <span>{member}</span>
              {isAdmin && member !== currentUser.uid && (
                <button
                  onClick={() => removeMember(member)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* ✅ Add Member */}
        {isAdmin && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter user ID"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              className="border p-2 w-full"
            />
            <button
              onClick={addMember}
              className="bg-blue-500 text-white w-full p-2 mt-2 rounded"
            >
              Add Member
            </button>
          </div>
        )}

        {/* ✅ Delete Group (Only Admin) */}
        {isAdmin && (
          <button
            onClick={deleteGroup}
            className="bg-red-500 text-white w-full p-2 mt-4 rounded"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Group"}
          </button>
        )}

        {/* ✅ Leave Group */}
        <button
          onClick={leaveGroup}
          className="bg-gray-500 text-white w-full p-2 mt-4 rounded"
        >
          Leave Group
        </button>

        {/* ✅ Close Button */}
        <button
          onClick={closeSettings}
          className="mt-3 text-sm text-gray-700 underline w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupSettings;
