"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";
import { User, Group } from "@/types/global";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

interface GroupListProps {
  currentUser: User;
  onSelectGroup: (group: Group) => void;
}

const GroupList: React.FC<GroupListProps> = ({
  currentUser,
  onSelectGroup,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(firestore, "groups"),
      where("members", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[];
      setGroups(groupData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-3">Your Groups</h2>
      {groups.length === 0 ? (
        <p className="text-gray-500">You are not part of any group.</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li
              key={group.id}
              className="flex items-center justify-between p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-100"
              onClick={() => onSelectGroup(group)}
            >
              <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-xs text-gray-500">
                  Members: {group.members.length}
                </p>
              </div>
              <IoChatbubbleEllipsesOutline className="text-lg text-gray-600" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupList;
