"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import {
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";

const LoginPage = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const googleProvider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign-in user:", result.user);

      const user = result.user;

      // Check if email is verified
      if (!user.emailVerified) {
        const actionCodeSettings = {
          url: "http://localhost:3000",
        };

        await sendEmailVerification(user, actionCodeSettings);
        alert(
          "A verification link has been sent to your email. Please verify to continue."
        );
        return;
      }

      const userRef = doc(getFirestore(), "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      // If user doesn't exist in Firestore, redirect to profile setup page
      if (!userSnapshot.exists()) {
        router.push(`/profile-setup?uid=${user.uid}`); // Redirect with UID
      } else {
        router.push("/live-streamers"); // Redirect existing user to live-streamers
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-xl"
        >
          X
        </button>
        <h1 className="text-2xl font-bold mb-4 text-center">
          Welcome to Young Streamers!
        </h1>

        {/* Login Option */}
        <div className="my-28 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex justify-center items-center bg-black text-white p-3 w-full rounded-full hover:bg-gray-800 transition"
          >
            <span className="me-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="none"
                viewBox="0 0 32 32"
              >
                <path
                  fill="#4285F4"
                  fillRule="evenodd"
                  d="M27.52 16.272c0-.85-.076-1.669-.218-2.454H16v4.642h6.458a5.52 5.52 0 0 1-2.394 3.621v3.011h3.878c2.269-2.089 3.578-5.165 3.578-8.82"
                  clipRule="evenodd"
                ></path>
                <path
                  fill="#34A853"
                  fillRule="evenodd"
                  d="M16 28c3.24 0 5.956-1.075 7.942-2.907l-3.878-3.011c-1.075.72-2.45 1.145-4.064 1.145-3.125 0-5.77-2.11-6.715-4.947H5.276v3.109A12 12 0 0 0 16 27.999"
                  clipRule="evenodd"
                ></path>
                <path
                  fill="#FBBC05"
                  fillRule="evenodd"
                  d="M9.285 18.28A7.2 7.2 0 0 1 8.91 16c0-.79.136-1.56.376-2.28v-3.109H5.276A12 12 0 0 0 4 16.001c0 1.935.464 3.768 1.276 5.388z"
                  clipRule="evenodd"
                ></path>
                <path
                  fill="#EA4335"
                  fillRule="evenodd"
                  d="M16 8.773c1.762 0 3.344.605 4.587 1.794l3.442-3.442C21.951 5.19 19.235 4 16 4c-4.69 0-8.75 2.69-10.724 6.61l4.01 3.11c.943-2.836 3.589-4.947 6.714-4.947"
                  clipRule="evenodd"
                ></path>
              </svg>
            </span>
            Continue with Google
          </button>
        </div>
        <div className="space-y-4">
          {/* Google Sign-In */}
          <p className="flex justify-center items-center p-3 text-gray text-xs w-full">
            By logging in, you confirm you’re over 18 years old and agree to our
            Terms of Use and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
