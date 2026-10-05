"use client";

import { useEffect, useState } from "react";

interface FloatingMessageProps {
  message: string;
}

export default function FloatingMessage({
  message,
}: FloatingMessageProps) {
  const [expanded, setExpanded] = useState(false);
  const [showIcon, setShowIcon] = useState(true);

  useEffect(() => {
    setExpanded(false);
    setShowIcon(true);

    const expandTimer = setTimeout(() => {
      setExpanded(true);
    }, 80);

    const iconTimer = setTimeout(() => {
      setShowIcon(false);
    }, 900);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(iconTimer);
    };
  }, [message]);

  return (
    <div className="flex w-full justify-end">
      <div
        className={`
          flex h-[52px] items-center overflow-hidden rounded-full
          bg-violet-700 text-white
          shadow-[0_12px_35px_rgba(76,29,149,0.28)]
          transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${expanded ? "max-w-[520px]" : "max-w-[52px]"}
        `}
      >
        {/* Icon */}

        <div
          className={`
            flex h-[52px] w-[52px] shrink-0 items-center justify-center
            rounded-full bg-violet-800
            transition-all duration-300
            ${showIcon ? "scale-100 opacity-100" : "w-0 scale-50 opacity-0"}
          `}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 7.8 7.8 0 0 1-4.4-1.3L4 19l1.2-3.4A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />

            <path d="M8.5 11.5h.01" />
            <path d="M12 11.5h.01" />
            <path d="M15.5 11.5h.01" />
          </svg>
        </div>

        {/* Message */}

        <div
          className={`
            overflow-hidden whitespace-nowrap
            transition-all duration-500 ease-out
            ${
              expanded
                ? "max-w-[440px] opacity-100"
                : "max-w-0 opacity-0"
            }
          `}
        >
          <p className="px-5 text-sm font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}