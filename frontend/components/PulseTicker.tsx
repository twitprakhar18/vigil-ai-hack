"use client";

import { useEffect, useState } from "react";

const EVENTS = [
  { text: "New urgent mention on X — @frustrated_renter_bandra", color: "text-red-500" },
  { text: "Reddit r/mumbai post gaining traction — 847 upvotes", color: "text-orange-500" },
  { text: "Trust Score dropped 3 points in last 6 hours", color: "text-red-400" },
  { text: "Influencer @TechWithRahul posted a review thread (245k followers)", color: "text-purple-500" },
  { text: "Google Review flagged — 1-star from Priya Sharma", color: "text-orange-400" },
  { text: "GEO: ChatGPT cited MagicBricks 4x more than Housing.com today", color: "text-indigo-500" },
  { text: "AI draft approved and posted by team for mention #5", color: "text-green-500" },
  { text: "Crisis alert: 'data breach' keyword spike detected on X", color: "text-red-600" },
];

export default function PulseTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % EVENTS.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const event = EVENTS[index];

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      <p
        className={`text-xs truncate transition-opacity duration-300 ${event.color} ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {event.text}
      </p>
    </div>
  );
}
