"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { auth, db, firestore } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaCoins } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";

export default function MenuBar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // 🔍 Function to search users by name (case-insensitive)
  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }
    try {
      const usersRef = collection(firestore, "users");
      const q = query(
        usersRef,
        where("name_lowercase", ">=", searchTerm.toLowerCase()),
        where("name_lowercase", "<=", searchTerm.toLowerCase() + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      console.log("🔥 Fetched Users:", users);
      setResults(users);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    }
  };

  // 🔄 Run search whenever the searchTerm changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // 🆔 Set Logged-in User ID
      } else {
        setUserId(null); // ❌ No user logged in
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userLoggedIn");
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="bg-white via-pink-200 to-pink-500 ... sticky top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 md:flex items-center justify-center hidden">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-700 hover:text-blue-600"
            >
              <Image
                className="object-contain"
                src="/logo.webp"
                alt="Logo"
                width={70}
                height={70}
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/live-streamers"
              className="flex flex-col items-center text-gray-700 hover:text-blue-600 text-center"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              <span className="text-xs">For You</span>
            </Link>
            <Link
              href="/following"
              className="flex flex-col items-center text-gray-700 hover:text-blue-600 text-center"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-xs">Following</span>
            </Link>
            <Link
              href="/chat"
              className="flex flex-col items-center text-gray-700 hover:text-blue-600 text-center"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>

              <span className="text-xs">Chat</span>
            </Link>
            <div className="relative">
              <input
                className="w-full flex-1 p-3 border rounded-full"
                type="text"
                placeholder="Search User"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <CiSearch className="text-gray-500 absolute top-[30%] right-[5%]" />
              {results.length > 0 && (
                <div className="absolute bg-white shadow-lg w-full mt-1 rounded">
                  {results.map((user) => (
                    <div
                      key={user.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => router.push(`/profile/${user.id}`)}
                    >
                      {user.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Logout and User Info */}
          <div className="flex">
            <div className="hidden md:flex justify-between items-center rounded-full bg-gray-100 px-3 py-2 mx-2">
              <p className="text-xs">My balance</p>
              <FaCoins className="ms-2 text-orange-500" />
              <span className="text-xs ms-2">{userData?.earned || "0"}</span>
              {/* Dynamic Earned */}
              <button className="text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-[50px] px-2 text-center ms-2">
                +
              </button>
            </div>
            <div className="relative">
              <Image
                className="rounded-full cursor-pointer"
                src={userData?.profilePic || "/ak.jpg"} // Dynamic Profile Picture
                alt="User Icon"
                width={40}
                height={40}
                onClick={toggleMenu}
              />
              {isMenuOpen && (
                <div className="absolute left-0 md:left-auto right-auto md:right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg">
                  <ul className="py-2">
                    <li className="px-4 py-2 hover:bg-gray-100">
                      <Link
                        href={`/profile/${userId}`}
                        className="block text-sm"
                      >
                        User Profile
                      </Link>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 text-sm">
                      Following:
                      <span className="font-bold">
                        {userData?.following || "0"}
                      </span>
                      {/* Dynamic Following */}
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 text-sm">
                      Followers:
                      <span className="font-bold">
                        {userData?.followers || "0"}
                      </span>
                      {/* Dynamic Followers */}
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 text-sm">
                      <Link href="/social-games" className="block">
                        Social Games
                      </Link>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 text-sm">
                      <Link href="/payment-settings" className="block">
                        Payment Settings
                      </Link>
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
          {/* user */}
          <div className="hidden">
            <Image
              className="rounded-[50px]"
              src="/ak.jpg"
              alt="User Icon"
              width={25}
              height={25}
            />
            <button className="text-gray-700 ms-2 hover:text-blue-600">
              Login/Register
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/suggestions"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100"
            >
              <svg
                className="h-8 w-8 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </Link>
            <Link
              href="/following"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </Link>
            <Link
              href="/explore"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <circle cx="10" cy="10" r="7" />
                <line x1="21" y1="21" x2="15" y2="15" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
