// young-streamers/src/app/components/MainPage.tsx
"use client";
import React, { useState, useEffect } from "react";
import LoginModal from "../login/page"; // Corrected path to the LoginModal component
import { useRouter } from "next/navigation";

export default function MainPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const router = useRouter();

  // Ensure component is only rendered after hydration to avoid SSR issues
  useEffect(() => {
    setHydrated(true);
    if (localStorage.getItem("userLoggedIn")) {
      router.push("/youngStreamer"); // Redirect to youngStreamer if logged in
    }
  }, []); // Empty dependency array ensures this runs only once after component mounts

  if (!hydrated) return null; // Prevent render until hydrated

  const openModal = () => {
    setIsModalOpen(true); // Open modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close modal
  };

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 w-full">
        <div className="relative">
          {/* Video for desktop */}
          <video
            className="w-full h-full object-cover hidden md:block"
            src="/banner-bgD.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* Video for mobile */}
          <video
            className="w-full h-full object-cover block md:hidden"
            src="/banner-bgM.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute top-[15%] left-[10%]">
            <p className="text-white text-[1rem] leading-[1rem] md:text-[3.5rem] md:leading-[3.5rem] font-bold">
              Join your dream global
              <br />
              live-streaming platform
            </p>
            <br />
            <p className="text-white text-[.7rem] leading-[.7rem] md:text-[1.5rem] md:leading-[1.5rem] font-bold">
              for content creation, social communication, <br />
              and the best live entertainment.
            </p>
            <div className="">
              {/* Button to open modal */}
              <button
                onClick={openModal}
                className="text-white text-4xl bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-[50px] text-2xl px-20 py-5 text-center me-2 mb-2 mt-16"
              >
                Login/Register
              </button>

              {/* Modal conditionally rendered */}
              {isModalOpen && (
                <LoginModal isOpen={isModalOpen} onClose={closeModal} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
