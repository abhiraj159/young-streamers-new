//young-streamers/src/app/realTimeLive/page.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RxCross2 } from "react-icons/rx";
import MenuBar from "../components/MenuBar";
import { db } from "@/lib/firebaseConfig";
import { ref, onValue, remove, push, set } from "firebase/database";
import Peer from "simple-peer";

const RealTimeLive = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams(); // Use useSearchParams
  const streamId = searchParams.get("streamId"); // Access streamId
  const [liveStreamData, setLiveStreamData] = useState<object | null>(null); // Type as object or null
  const [peers, setPeers] = useState<any[]>([]);

  useEffect(() => {
    const fetchLiveStreamData = async () => {
      if (streamId) {
        const liveStreamRef = ref(db, `liveStreams/${streamId}`);
        onValue(liveStreamRef, (snapshot) => {
          const data = snapshot.val() as object; // Type assertion
          setLiveStreamData(data);
        });
      }
    };

    fetchLiveStreamData();

    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const peer = new Peer({ initiator: true, stream });

        peer.on("signal", (data) => {
          if (streamId) {
            const signalingRef = ref(db, `signaling/${streamId}`);
            push(signalingRef, data);
          }
        });

        peer.on("connect", () => {
          console.log("Connected to peer!");

          // *** THIS IS THE MISSING PART ***
          if (streamId && liveStreamData) {
            set(ref(db, `liveStreams/${streamId}`), liveStreamData)
              .then(() => console.log("Live stream data set successfully"))
              .catch((error) =>
                console.error("Error setting live stream data:", error)
              );
          }
        });

        peerRef.current = peer;
      } catch (error) {
        console.error("Error accessing media devices:", error);
        alert("Failed to access camera or microphone.");
        router.push("/go-live");
      }
    };

    if (streamId) {
      startStream();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [router, streamId]);
  const stopStreaming = () => {
    // Declared OUTSIDE useEffect
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (streamId) {
      remove(ref(db, `liveStreams/${streamId}`));
      remove(ref(db, `signaling/${streamId}`));
    }
    router.push("/go-live");
  };

  return (
    <>
      <MenuBar />
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center mt-32 relative">
        <div className="w-full h-3/4 flex justify-center items-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full md:w-2/3 h-full object-cover border border-gray-500 rounded-lg"
          ></video>
        </div>
        <button
          onClick={stopStreaming}
          className="absolute top-1 left-1 mt-4 p-3 text-white rounded-lg"
        >
          <RxCross2 />
        </button>
      </div>
    </>
  );
};

export default RealTimeLive;
