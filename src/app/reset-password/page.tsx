"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import {
  confirmPasswordReset,
  getAuth,
  verifyPasswordResetCode,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode"); // Firebase reset password code from query
  const router = useRouter();

  // Verify reset password code
  React.useEffect(() => {
    if (!oobCode) {
      setError("Invalid or expired reset link.");
    } else {
      const authInstance = getAuth();
      verifyPasswordResetCode(authInstance, oobCode)
        .then(() => {
          // Code is valid, proceed with reset process
        })
        .catch((err) => setError("Invalid or expired reset link."));
    }
  }, [oobCode]);

  // Handle password reset submission
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const authInstance = getAuth();
      await confirmPasswordReset(authInstance, oobCode!, newPassword);
      setSuccess("Password reset successfully!");
      setTimeout(() => router.push("/login"), 3000); // Redirect to login after 3 seconds
    } catch (err: any) {
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form
        onSubmit={handlePasswordReset}
        className="flex flex-col gap-4 p-6 bg-gray-100 rounded shadow-md w-full max-w-md"
      >
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
