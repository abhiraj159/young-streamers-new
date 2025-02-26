"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebaseConfig"; // Firebase import
import { onAuthStateChanged } from "firebase/auth";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoutes = ({ children }: PrivateRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/login"); // Redirect to login if not authenticated
      }
      setLoading(false); // Stop loading after auth state is checked
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Show loading while checking auth status
  }

  return isAuthenticated ? <>{children}</> : null; // Render children if authenticated
};

export default PrivateRoutes;
