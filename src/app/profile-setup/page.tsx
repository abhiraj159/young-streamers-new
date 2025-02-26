"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore, storage } from "@/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore"; // Firestore functions
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage functions
import { onAuthStateChanged } from "firebase/auth";

const ProfileSetupPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "",
    country: "",
    profileImage: null as File | null, // Profile image file
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; // Extract files from event
    if (files && files[0]) {
      // Null check to ensure files exist
      setFormData((prev) => ({ ...prev, profileImage: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading state

    try {
      if (
        !formData.name ||
        !formData.age ||
        !formData.country ||
        !formData.sex
      ) {
        alert("Please fill all the required fields");
        setLoading(false);
        return;
      }

      const user = auth.currentUser; // Get current logged-in user
      if (!user) {
        alert("User not logged in");
        setLoading(false);
        return;
      }

      let profileImageUrl = "";

      // Upload profile image to Firebase Storage if it exists
      if (formData.profileImage) {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, formData.profileImage); // Upload file to Firebase Storage
        profileImageUrl = await getDownloadURL(storageRef); // Get the image URL after upload
      }

      // Save user details in Firestore with lowercase name
      const userRef = doc(firestore, "users", user.uid);
      await setDoc(userRef, {
        name: formData.name,
        name_lowercase: formData.name.toLowerCase(), // ✅ Store lowercase name
        age: formData.age,
        country: formData.country,
        sex: formData.sex,
        email: user.email,
        profileImage: profileImageUrl || "", // Profile image URL if uploaded
      });

      // Redirect to profile page after successful upload
      router.push(`/profile/${userId}`);
    } catch (error: any) {
      console.error("Error uploading profile:", error);
      alert("Error uploading profile. Please try again.");
    } finally {
      setLoading(false); // Stop loading state
    }
  };

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

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Profile Setup</h2>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700"
          >
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            className="w-full p-3 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="sex"
            className="block text-sm font-medium text-gray-700"
          >
            Gender
          </label>
          <select
            id="sex"
            name="sex"
            value={formData.sex}
            onChange={handleInputChange}
            className="w-full p-3 border rounded"
            required
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full p-3 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="profileImage"
            className="block text-sm font-medium text-gray-700"
          >
            Profile Image
          </label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            onChange={handleFileChange}
            className="w-full p-3 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetupPage;
