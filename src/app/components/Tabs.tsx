"use client";
import React, { useState } from "react";

export default function TabsDefault() {
  const data = [
    {
      label: "ALL",
      value: "all",
      desc: `It really matters and then like it really doesn't matter.
        What matters is the people who are sparked by it. And the people 
        who are like offended by it, it doesn't matter.`,
    },
    {
      label: "FOR FANS",
      value: "forFans",
      desc: `Because it's about motivating the doers. Because I'm here
        to follow my dreams and inspire other people to follow their dreams, too.`,
    },
    {
      label: "CAPTURED",
      value: "captured",
      desc: `We're not always in the position that we want to be at.
        We're constantly growing. We're constantly making mistakes. We're
        constantly trying to express ourselves and actualize our dreams.`,
    },
  ];

  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="w-full p-5">
      <div className="relative">
        <div className="flex bg-gray-100 p-4 mb-4 rounded-lg">
          {data.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`py-2 px-4 font-bold text-sm transition-all duration-300 relative
                ${
                  activeTab === value
                    ? "bg-white text-blue-600 shadow-md scale-105"
                    : "hover:bg-gray-300"
                } 
                rounded-lg me-20`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="">
        {data.map(({ value, desc }) => (
          <div
            key={value}
            className={`tab-panel ${activeTab === value ? "block" : "hidden"}`}
          >
            {desc}
          </div>
        ))}
      </div>
    </div>
  );
}
