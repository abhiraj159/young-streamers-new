// young-streamers/src/app/home/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Added signOut for logout functionality
import Link from "next/link";
import MenuBar from "../components/MenuBar";
import {
  requestNotificationPermission,
  onNotificationListener,
} from "../utils/notificationHelper";

const HomePage = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Effect to check if user is logged in or not
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login"); // Agar user login nahi hai to login page pe redirect karo
      }
    });

    return () => unsubscribe(); // Clean up subscription
  }, [router]);

  // Request for notification permission and handle notifications
  useEffect(() => {
    requestNotificationPermission().then((token) => {
      if (token) {
        console.log("Notification token saved successfully: ", token);
        // Optionally, token ko backend pe bhej sakte hain
      } else {
        console.warn("User denied notification permission.");
      }
    });

    onNotificationListener((payload) => {
      alert(`New Notification: ${payload.notification?.title}`);
      console.log("Notification payload:", payload);
    });
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign-out function
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };

  return (
    <>
      <MenuBar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
        <h1 className="text-2xl font-bold mb-4">Welcome to Live Streamers</h1>
        {user ? (
          <>
            <p className="text-xl">Welcome, {user.displayName}!</p>
            <Link href="/live-streamers">
              <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-4">
                Go to Live Streamers
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-4"
            >
              Logout
            </button>
          </>
        ) : (
          <p className="text-xl">Please log in to see live streamers.</p>
        )}
      </div>
    </>
  );
};

export default HomePage;
