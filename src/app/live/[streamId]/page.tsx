"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Change from useRouter to useSearchParams
import { db } from "@/lib/firebaseConfig"; // Firebase config
import { ref, get } from "firebase/database";
import Image from "next/image";

const LiveStreamPage = () => {
  const searchParams = useSearchParams(); // Using useSearchParams for query params
  const streamId = searchParams.get("streamId"); // Get streamId from query params
  const [streamData, setStreamData] = useState<any>(null);

  // Firebase reference for stream details using streamId
  const streamRef = ref(db, `liveStreams/${streamId}`);

  useEffect(() => {
    if (streamId) {
      // Fetch live stream data from Firebase
      get(streamRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setStreamData(snapshot.val()); // Set stream data if exists
          } else {
            console.log("Stream not found");
          }
        })
        .catch((error) => {
          console.error("Error fetching stream data:", error);
        });
    }
  }, [streamId]);

  if (!streamData) {
    return (
      <div className="text-center">
        <p>Loading stream...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <h1 className="text-4xl font-bold mb-6">Live Stream</h1>
      <div className="relative">
        {/* Stream video */}
        <video
          className="w-full h-auto"
          controls
          autoPlay
          muted
          src={`stream-${streamData.streamUrl}`} // Replace with actual video source URL
        ></video>

        {/* Stream details */}
        <div className="absolute bottom-5 left-5 bg-black text-white p-4 rounded-md">
          <p>User ID: {streamData.userId}</p>
          <p>
            Stream started at: {new Date(streamData.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPage;
