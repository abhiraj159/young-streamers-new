import { auth } from "@/lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔥 Checking Firebase Auth Object:", auth); // ✅ Yahan Firebase auth check hoga

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("👤 Current User from Auth:", currentUser); // ✅ Ye dekhega ki user login hai ya nahi

      setUser(currentUser);
      setLoading(false);

      if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
        console.log("🔥 Using Firebase Emulator for Auth");
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login successful");
    } catch (e) {
      console.error("❌ Error during login:", e);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Registration successful");
    } catch (e) {
      console.error("❌ Error during registration:", e);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("✅ Logout successful");
    } catch (e) {
      console.error("❌ Error during logout:", e);
    }
  };

  return { user, loading, login, register, logout };
};
