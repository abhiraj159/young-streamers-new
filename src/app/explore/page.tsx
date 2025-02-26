"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import { ref, onValue } from "firebase/database"; // Realtime Database import
import MenuBar from "../components/MenuBar";

const ExplorePage = () => {
  const [streams, setStreams] = useState<any[]>([]);

  const streamsRef = ref(db, "exploreStreams"); // Firebase reference

  // Fetch explore streams from Firebase
  useEffect(() => {
    const unsubscribe = onValue(streamsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const streamsArray = Object.values(data);
        setStreams(streamsArray);
      } else {
        setStreams([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <MenuBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-4">
        <h2 className="text-xl font-semibold">Explore Streams</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((stream, index) => (
            <div key={index} className="relative">
              <button>
                <img
                  src={stream.thumbnail}
                  alt="Stream Thumbnail"
                  className="object-cover w-full h-full"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ExplorePage;
