"use client";

import React, { useEffect, useState } from "react";
import { auth, firestore } from "@/lib/firebaseConfig";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import MenuBar from "@/app/components/MenuBar";

interface User {
  id: string;
  name: string;
  profileImage: string;
}

const FollowingPage = () => {
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) return;

    const followingRef = doc(firestore, "following", currentUser.uid);
    const unsubscribeFollowing = onSnapshot(followingRef, async (docSnap) => {
      if (docSnap.exists()) {
        const followingIds = docSnap.data().following || [];

        // Users collection se naam aur image fetch karna
        const followingDetails = await Promise.all(
          followingIds.map(async (followingId: string) => {
            const userDoc = await getDoc(doc(firestore, "users", followingId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                id: followingId,
                name: userData.name || "Unknown",
                profileImage: userData.profileImage || "/default-avatar.png",
              };
            }
            return null;
          })
        );

        setFollowingList(followingDetails.filter((user) => user !== null));
      }
    });

    return () => unsubscribeFollowing();
  }, [currentUser]);

  const handleUnfollow = async (followingId: string) => {
    if (!currentUser) return;

    const followersRef = doc(firestore, "followers", followingId);
    const followingRef = doc(firestore, "following", currentUser.uid);

    try {
      await updateDoc(followersRef, {
        followers: arrayRemove(currentUser.uid),
      });
      await updateDoc(followingRef, { following: arrayRemove(followingId) });

      // UI se bhi hata do taki real-time effect dikhe
      setFollowingList((prev) =>
        prev.filter((user) => user.id !== followingId)
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  return (
    <>
      <MenuBar />
      <div className="mt-4 p-4 w-4/5 mx-auto min-h-screen">
        <h2 className="text-2xl font-bold">Following</h2>
        <ul className="mt-4">
          {followingList.length > 0 ? (
            followingList.map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center p-2 border-b"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                    className="cursor-pointer text-blue-600"
                    onClick={() => router.push(`/profile/${user.id}`)}
                  >
                    {user.name}
                  </span>
                </div>
                <button
                  className="px-4 py-2 text-sm rounded bg-gray-300"
                  onClick={() => handleUnfollow(user.id)}
                >
                  Following
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500">You're not following anyone yet.</p>
          )}
        </ul>
      </div>
    </>
  );
};

export default FollowingPage;
