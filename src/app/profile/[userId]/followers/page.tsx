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
import { useParams, useRouter } from "next/navigation";
import MenuBar from "@/app/components/MenuBar";

interface User {
  id: string;
  name: string;
  profileImage: string;
}

const FollowersPage = () => {
  const { userId } = useParams();
  const userIdString = Array.isArray(userId) ? userId[0] : userId || "";
  const [followers, setFollowers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!userIdString) return;

    const followersRef = doc(firestore, "followers", userIdString);
    const unsubscribeFollowers = onSnapshot(followersRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const followerIds = data.followers || [];

        // Users collection se naam aur image fetch karna
        const followerDetails = await Promise.all(
          followerIds.map(async (followerId: string) => {
            const userDoc = await getDoc(doc(firestore, "users", followerId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                id: followerId,
                name: userData.name || "Unknown",
                profileImage: userData.profileImage || "/default-avatar.png",
              };
            }
            return null;
          })
        );

        setFollowers(followerDetails.filter((user) => user !== null));
      }
    });

    return () => unsubscribeFollowers();
  }, [userIdString]);

  useEffect(() => {
    if (!currentUser) return;

    const followingRef = doc(firestore, "following", currentUser.uid);
    const unsubscribeFollowing = onSnapshot(followingRef, (docSnap) => {
      if (docSnap.exists()) {
        setFollowingList(docSnap.data().following || []);
      }
    });

    return () => unsubscribeFollowing();
  }, [currentUser]);

  const handleFollowToggle = async (followerId: string) => {
    if (!currentUser) return;

    const followersRef = doc(firestore, "followers", followerId);
    const followingRef = doc(firestore, "following", currentUser.uid);

    try {
      if (followingList.includes(followerId)) {
        await updateDoc(followersRef, {
          followers: arrayRemove(currentUser.uid),
        });
        await updateDoc(followingRef, { following: arrayRemove(followerId) });
      } else {
        await updateDoc(followersRef, {
          followers: arrayUnion(currentUser.uid),
        });
        await updateDoc(followingRef, { following: arrayUnion(followerId) });
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <>
      <MenuBar />
      <div className="mt-4 p-4 w-4/5 mx-auto min-h-screen">
        <h2 className="text-2xl font-bold">Followers</h2>
        <ul className="mt-4">
          {followers.length > 0 ? (
            followers.map((follower) => (
              <li
                key={follower.id}
                className="flex justify-between items-center p-2 border-b"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={follower.profileImage}
                    alt={follower.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                    className="cursor-pointer text-blue-600"
                    onClick={() => router.push(`/profile/${follower.id}`)}
                  >
                    {follower.name}
                  </span>
                </div>
                <button
                  className={`px-4 py-2 text-sm rounded ${
                    followingList.includes(follower.id)
                      ? "bg-gray-300"
                      : "bg-blue-500 text-white"
                  }`}
                  onClick={() => handleFollowToggle(follower.id)}
                >
                  {followingList.includes(follower.id)
                    ? "Friend"
                    : "Follow Back"}
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No followers yet.</p>
          )}
        </ul>
      </div>
    </>
  );
};

export default FollowersPage;
