// young-streamers/src/app/go-live/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaBackwardStep } from "react-icons/fa6";
import { db } from "@/lib/firebaseConfig";
import { ref, set, onValue, remove, push } from "firebase/database";
import { MdWorkspacePremium } from "react-icons/md";
import { RiLiveLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { getAuth } from "firebase/auth";

const GoLivePage = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [amount, setAmount] = useState(0);
  const [isPremiumPageVisible, setIsPremiumPageVisible] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const liveStreamsRef = ref(db, "liveStreams");
    const unsubscribe = onValue(liveStreamsRef, (snapshot) => {
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

  const toggleCamera = async () => {
    if (!isCameraOn) {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: isMicOn,
      });
      const video = document.querySelector("video");
      if (video) {
        video.srcObject = newStream;
      }
      setStream(newStream);
      setIsCameraOn(true);
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const video = document.querySelector("video");
      if (video) {
        video.srcObject = null;
      }
      setStream(null);
      setIsCameraOn(false);
    }
  };

  const toggleMic = async () => {
    setIsMicOn((prev) => !prev);
  };

  const handleLive = async (isPremiumStream: boolean) => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    const streamId = `stream_${Date.now()}`;

    // Store live stream info in Firebase
    const liveStreamRef = ref(db, `liveStreams/${streamId}`);
    await set(liveStreamRef, {
      userId,
      streamUrl: streamId,
      premiumAmount: isPremiumStream ? amount : 0,
      timestamp: Date.now(),
      notificationMessage,
    });

    // Send notification to followers (using push notifications - requires setup)
    if (notificationMessage) {
      const notificationsRef = ref(db, `notifications/${userId}/followers`);
      await push(notificationsRef, {
        message: notificationMessage,
        timestamp: Date.now(),
      });
    }

    router.push(`/realTimeLive?streamId=${streamId}`);
  };

  return (
    <div className="flex flex-col md:flex-row overflow-hidden px-4">
      <div className="w-full md:w-1/4 p-4">
        <div className="mt-4 mb-20 flex items-center justify-between">
          <RxCross2
            className="cursor-pointer text-2xl"
            onClick={() => router.back()}
          />
          <h2 className="text-xl font-semibold">
            Set up your <br /> live broadcast
          </h2>
          <div> &nbsp;</div>
        </div>

        <div className="mb-4">
          <label>Notification for Followers</label>
          <input
            className="w-full p-2 border rounded-md mt-2"
            placeholder="Enter your message"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <label>Camera</label>
          <div
            className={`relative w-10 h-5 rounded-full ${
              isCameraOn ? "bg-green-400" : "bg-gray-300"
            }`}
            onClick={toggleCamera}
            style={{ cursor: "pointer" }}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                isCameraOn ? "transform translate-x-5" : ""
              }`}
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <label>Mic</label>
          <div
            className={`relative w-10 h-5 rounded-full ${
              isMicOn ? "bg-green-400" : "bg-gray-300"
            }`}
            onClick={toggleMic}
            style={{ cursor: "pointer" }}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                isMicOn ? "transform translate-x-5" : ""
              }`}
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="ms-2 inline-block text-center">
            <RiLiveLine
              onClick={() => handleLive(false)}
              className="fill-gray-500 hover:fill-pink-500 cursor-pointer m-2 text-2xl"
            />
            <p className="text-xs">Public</p>
          </div>
          <div className="ms-2 inline-block text-center">
            <MdWorkspacePremium
              onClick={() => {
                setIsPremium(true);
                setIsPremiumPageVisible(true);
              }}
              className="fill-gray-500 hover:fill-pink-500 cursor-pointer m-2 text-2xl"
            />
            <p className="text-xs">Premium</p>
          </div>
        </div>

        {isPremiumPageVisible && (
          <div className="mb-4 border p-4 rounded-md">
            <div className="w-full flex justify-between items-center">
              <FaBackwardStep onClick={() => setIsPremiumPageVisible(false)} />
              <h3>Select Amount</h3>
            </div>
            <div className="mt-4">
              {[
                99, 199, 299, 499, 999, 1499, 1999, 2499, 2999, 3599, 3999,
                4999, 5999, 6999, 7999, 8999, 9999,
              ].map((amountOption) => (
                <button
                  key={amountOption}
                  onClick={() => setAmount(amountOption)}
                  className={`rounded-full p-2 mt-2 ${
                    amount === amountOption ? "bg-blue-500" : "bg-gray-500"
                  } text-white mx-1`}
                >
                  ₹{amountOption}
                </button>
              ))}
              <button
                onClick={() => handleLive(true)}
                disabled={amount === 0}
                className={`$${
                  amount === 0
                    ? "w-full mt-5 bg-white text-black border border-gray-500 rounded-[50px] p-4"
                    : "w-full mt-5 text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-[50px] p-4"
                }`}
              >
                {amount === 0 ? "Set Premium Live" : "Go Live"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full md:w-3/4 bordered-2 border-gray-600 rounded-md">
        <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
          {isCameraOn ? (
            <video
              className="w-full md:w-1/3 h-full object-cover"
              playsInline
              autoPlay
              muted
              ref={(video) => {
                if (video) video.srcObject = stream;
              }}
            ></video>
          ) : (
            <span className="text-white">Camera is Off</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoLivePage;
