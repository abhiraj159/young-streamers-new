// young-streamers/src/app/components/GoLiveButton.tsx

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const GoLiveButton = ({ startLiveStream }: { startLiveStream: () => void }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/go-live"); // This will navigate to the Go Live page
  };

  return (
    <div className="fixed right-[2%] bottom-5">
      <button
        onClick={handleClick}
        className="fixed right-[2%] bottom-5 relative w-16 h-16 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-full me-2 mb-2"
      >
        <Image
          src="/GoLive-icon.webp"
          alt="Go Live"
          width={35}
          height={35}
          className="absolute inset-0 m-auto"
        />
      </button>
    </div>
  );
};

export default GoLiveButton;
