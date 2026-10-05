"use client";

import { useEffect, useState } from "react";

const backgroundImages = [
  "/backgrounds/sky-1.jpg",
  "/backgrounds/sky-2.jpg",
  "/backgrounds/sky-3.jpg",
  "/backgrounds/nature-1.jpg",
  "/backgrounds/nature-2.jpg",
];

export default function Background() {
  const [background, setBackground] = useState(backgroundImages[0]);

  useEffect(() => {
    const randomIndex = Math.floor(
      Math.random() * backgroundImages.length
    );

    setBackground(backgroundImages[randomIndex]);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background image */}

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${background})`,
        }}
      />

      {/* Sky atmosphere */}

      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/45 via-sky-300/10 to-transparent" />

      {/* Grass / ground */}

      <div className="absolute bottom-0 h-[42%] w-full bg-gradient-to-t from-emerald-950/80 via-emerald-800/45 to-transparent" />

      {/* Overall readability */}

      <div className="absolute inset-0 bg-black/5" />
    </div>
  );
}