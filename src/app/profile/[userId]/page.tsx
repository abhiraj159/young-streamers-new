//young-streamers/src/app/profile/[userId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { auth, firestore } from "@/lib/firebaseConfig";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  setDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import Link from "next/link";
import MenuBar from "@/app/components/MenuBar";
import Image from "next/image";
import { RiVipDiamondFill } from "react-icons/ri";
import { LuUsers, LuUsersRound } from "react-icons/lu";
import Tabs from "@/app/components/Tabs";
import GoLiveButton from "@/app/components/GoLiveButton";
import { IoChatbubbles } from "react-icons/io5";

const ProfilePage = () => {
  const { userId } = useParams(); // ✅ Correct way to get userId
  const userIdString = Array.isArray(userId) ? userId[0] : userId || "";
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string>("");
  const [age, setAge] = useState<number | null>(null);
  const [sex, setSex] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [earned, setEarned] = useState<number>(0);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [profileData, setProfileData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const isCurrentUser = user && user.uid === auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return; // ✅ Agar `userId` nahi mila toh return kar do

    const fetchUserData = async () => {
      try {
        const userIdString = Array.isArray(userId) ? userId[0] : userId || ""; // ✅ Ensure it's a valid string
        if (!userIdString) return; // ✅ Agar still empty hai toh return kar do

        const userDocRef = doc(firestore, "users", userIdString); // ✅ Firestore reference tabhi banao jab userId valid ho
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setProfilePic(userData.profileImage || "");
          setName(userData.name || "Unknown");
          setAge(userData.age || null);
          setSex(userData.sex || "N/A");
          setCountry(userData.country || "N/A");
          setProfileData(userSnap.data());
        } else {
          console.log("No user data found");
          setError("User not found.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      }
    };

    const fetchCurrentUser = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
        }
      });
    };

    fetchUserData();
    fetchCurrentUser();
  }, [userIdString]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        await updateProfile(currentUser, {
          displayName: name,
        });

        const userDocRef = doc(firestore, "users", currentUser.uid);
        await updateDoc(userDocRef, {
          name: name,
          age: age,
          sex: sex,
          country: country,
        });

        setSuccess("Profile updated successfully!");
      } catch (err) {
        setError("Failed to update profile.");
      }
    }
  };

  const handleMessageClick = (userId: string) => {
    if (!userId) return;
    router.push(`/chat?userId=${userIdString}`);
  };

  useEffect(() => {
    if (!currentUser || !userIdString) return;

    const checkIfFollowing = async () => {
      const followingRef = doc(firestore, "following", currentUser.uid);
      const followingSnap = await getDoc(followingRef);

      if (followingSnap.exists()) {
        const followingData = followingSnap.data();
        setIsFollowing(followingData.following?.includes(userIdString));
      }
    };

    checkIfFollowing();
  }, [currentUser, userIdString]);

  const handleFollow = async () => {
    if (!currentUser || !userIdString) return;

    const followersRef = doc(firestore, "followers", userIdString);
    const followingRef = doc(firestore, "following", currentUser.uid);

    try {
      if (isFollowing) {
        await updateDoc(followersRef, {
          followers: arrayRemove(currentUser.uid),
        });
        await updateDoc(followingRef, { following: arrayRemove(userIdString) });
        setIsFollowing(false);
      } else {
        await setDoc(
          followersRef,
          { followers: arrayUnion(currentUser.uid) },
          { merge: true }
        );
        await setDoc(
          followingRef,
          { following: arrayUnion(userIdString) },
          { merge: true }
        );
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  useEffect(() => {
    if (!userIdString) return;

    const userDocRef = doc(firestore, "users", userIdString);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setProfilePic(userData.profileImage || "");
        setName(userData.name || "Unknown");
        setAge(userData.age || null);
        setSex(userData.sex || "N/A");
        setCountry(userData.country || "N/A");
      }
    });

    return () => unsubscribe();
  }, [userIdString]);

  useEffect(() => {
    if (!userIdString) return;

    const followersRef = doc(firestore, "followers", userIdString);
    const followingRef = doc(firestore, "following", userIdString);

    // Followers Count Listener
    const unsubscribeFollowers = onSnapshot(followersRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFollowers(data.followers?.length || 0);
      }
    });

    // Following Count Listener
    const unsubscribeFollowing = onSnapshot(followingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFollowing(data.following?.length || 0);
      }
    });

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, [userIdString]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <MenuBar />
      <div className="mt-2 min-h-screen w-4/5 mx-auto rounded-lg">
        <div className="flex">
          <div className="w-1/6">
            <Image
              src={profilePic || "/ak.jpg"}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <div className="w-5/6">
            <div className="flex items-center mt-2">
              <h3 className="text-2xl font-bold">{name}</h3>
              <span className="text-xs">
                ({age || "N/A"}, {sex || "N/A"})
              </span>
              <Image
                alt="Country Icon"
                src="/indian-flag.svg"
                width={10}
                height={7}
                className="ms-2"
              />
              <p className="text-sm text-gray-500 ms-1">{country}</p>
            </div>
            <div className="flex mt-4">
              <div className="text-sm font-bold">
                <span className="text-black">{earned}</span>
                <div className="text-xs text-gray-500 flex items-center">
                  <RiVipDiamondFill />
                  <span className="ms-1"> Earned</span>
                </div>
              </div>
              <div
                className="text-base font-bold ms-12 cursor-pointer"
                onClick={() =>
                  router.push(`/profile/${userIdString}/followers`)
                }
              >
                <span className="text-black">{followers}</span>
                <div className="text-xs text-gray-500 flex items-center">
                  <LuUsers />
                  <span className="ms-1"> Followers</span>
                </div>
              </div>
              <div
                className="text-base font-bold ms-12 cursor-pointer"
                onClick={() =>
                  router.push(`/profile/${userIdString}/following`)
                }
              >
                <span className="text-black">{following}</span>
                <div className="text-xs text-gray-500 flex items-center">
                  <LuUsersRound />
                  <span className="ms-1"> Following</span>
                </div>
              </div>
            </div>
            {currentUser?.uid !== userIdString && (
              <div className="flex">
                <button
                  className="mt-4 p-3 w-1/2 md:w-1/4 flex items-center cursor-pointer border rounded-full"
                  onClick={() => handleMessageClick(userIdString)}
                >
                  <IoChatbubbles />
                  <span className="ms-4">Message</span>
                </button>
                <button
                  className={`mt-4 ms-2 p-3 w-1/2 md:w-1/4 flex items-center justify-center cursor-pointer border rounded-full ${
                    isFollowing ? "bg-gray-300" : "bg-blue-500 text-white"
                  }`}
                  onClick={handleFollow}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : isFollowing
                    ? "Following"
                    : "Follow"}
                </button>
              </div>
            )}
            <div>
              <GoLiveButton startLiveStream={() => {}} />
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Tabs />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
