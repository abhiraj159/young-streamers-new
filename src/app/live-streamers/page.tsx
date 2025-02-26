"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { ref, onValue } from "firebase/database"; // Realtime Database imports
import { getFCMToken } from "@/lib/firebaseConfig"; // Import getFCMToken
import MenuBar from "../components/MenuBar";
import GoLiveButton from "../components/GoLiveButton";
import Image from "next/image";

const LiveStreamersPage = () => {
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const router = useRouter();

  // Firebase reference for liveStreams (using Realtime Database)
  const liveRef = ref(db, "liveStreams");

  // Fetch live streams from Firebase
  useEffect(() => {
    const unsubscribe = onValue(liveRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const streamsArray = Object.values(data);
        setLiveStreams(streamsArray);
      } else {
        setLiveStreams([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Join live stream functionality
  const joinLiveStream = (streamId: string) => {
    router.push(`/live/${streamId}`);
  };

  // Fetch FCM Token on Mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        await getFCMToken(); // Request FCM token
      } catch (error) {
        console.error("Error fetching FCM token:", error);
      }
    };

    fetchToken();
  }, []);

  return (
    <>
      <MenuBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-52 mb-4">
        <div className="relative px-10">
          {/* Go Live Button */}
          <GoLiveButton startLiveStream={() => {}} />
          {/* Use it in place of the previous button */}
          {/* Live Stream Thumbnails */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveStreams.map((stream, index) => (
              <div key={index} className="relative">
                <button onClick={() => joinLiveStream(stream.streamUrl)}>
                  <Image
                    src="/stream-thumbnail-placeholder.jpg"
                    alt="Live Stream Thumbnail"
                    width={320}
                    height={490}
                    className="object-cover"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveStreamersPage;
