"use client";

import React from "react";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-500 text-white">
      <h1 className="text-3xl font-bold">Something went wrong!</h1>
      <p>Please try again later or contact support.</p>
    </div>
  );
};

export default ErrorPage;
