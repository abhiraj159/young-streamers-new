import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/firebaseConfig"; // Firebase auth instance
import { onAuthStateChanged } from "firebase/auth";

// Middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages jo bina login ke access ho sakti hain
  const publicPaths = ["/", "/login", "/register"]; // Home, Login, Register pages

  // Agar user already login hai, toh login page par jaana nahi chahiye
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Firebase auth state check karo
  const user = await checkAuthState();

  // Agar user logged in nahi hai aur restricted page (jaise /live-streamers) access kar raha hai
  if (!user && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl); // Login page par redirect
  }

  // Agar user already login hai aur /login page par jaana chahta hai, toh /live-streamers page par redirect karenge
  if (user && pathname === "/login") {
    const liveStreamersUrl = new URL("/live-streamers", request.url);
    return NextResponse.redirect(liveStreamersUrl);
  }

  return NextResponse.next();
}

// Function to check auth state
const checkAuthState = async () => {
  return new Promise<any>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          resolve(user); // Agar user hai toh resolve karenge
        } else {
          resolve(null); // Agar user nahi hai, null resolve karo
        }
        unsubscribe(); // Cleanup
      },
      reject
    ); // Error handling
  });
};

// Configuring which paths the middleware should be applied to
export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"], // Exclude internal paths
};
