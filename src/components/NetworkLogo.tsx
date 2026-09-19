import React from "react";
import { motion } from "motion/react";

interface NetworkLogoProps {
  className?: string;
  isDarkMode?: boolean;
  brandName?: string;
}

export default function NetworkLogo({ className = "", isDarkMode = false, brandName = "UPASYO" }: NetworkLogoProps) {
  const isDefaultBrand = !brandName || brandName.trim().toUpperCase() === "UPASYO";

  if (!isDefaultBrand) {
    return (
      <div className={`relative flex items-center select-none ${className}`} id="upasyo-network-logo">
        <motion.div
          className="relative flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Glow behind the logo */}
          <div className={`absolute -inset-2 rounded-full blur-xl transition-all duration-700 opacity-60 ${
            isDarkMode ? "bg-pink-900/10" : "bg-pink-100/40"
          }`} />

          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold tracking-[0.18em] font-display uppercase ${
              isDarkMode ? "text-white" : "text-zinc-950"
            }`}>
              {brandName}
            </span>
            <div className="flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-brand-accent-pink animate-pulse" />
            </div>
          </div>

          {/* Accent floating subtitle node */}
          <div className="absolute -bottom-4 right-0.5 flex items-center gap-1 opacity-80 scale-75">
            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" />
            <span className="text-[8px] tracking-[0.2em] font-mono text-gray-400 dark:text-zinc-500 font-semibold uppercase">
              COG_SYSTEM
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // SVG points representing neural network nodes within the letters of UPASYO.
  // We'll overlay stylized connections and pulses.
  return (
    <div className={`relative flex items-center select-none ${className}`} id="upasyo-network-logo">
      <motion.div
        className="relative flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow behind the logo */}
        <div className={`absolute -inset-2 rounded-full blur-xl transition-all duration-700 opacity-60 ${
          isDarkMode ? "bg-pink-900/20" : "bg-pink-100/50"
        }`} />

        <svg
          viewBox="0 0 280 60"
          className="w-48 h-10 md:w-56 md:h-12 fill-none stroke-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Neural Connections (SVG Lines that animate) */}
          <g className="opacity-70">
            {/* Connection: U to P */}
            <motion.line
              x1="30" y1="18" x2="80" y2="18"
              stroke={isDarkMode ? "#ffd3e2" : "#f472b6"}
              strokeWidth="0.75"
              strokeDasharray="4 4"
              animate={{ strokeDashoffset: [0, -20] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 8 }}
            />
            {/* Connection: P to A */}
            <motion.line
              x1="90" y1="42" x2="135" y2="18"
              stroke={isDarkMode ? "#e2e8f0" : "#cbd5e1"}
              strokeWidth="0.75"
              strokeDasharray="6 3"
              animate={{ strokeDashoffset: [0, 20] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 12 }}
            />
            {/* Connection: A to S */}
            <motion.line
              x1="145" y1="35" x2="180" y2="42"
              stroke={isDarkMode ? "#ffd3e2" : "#fbcfe8"}
              strokeWidth="1"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            {/* Connection: S to Y */}
            <motion.line
              x1="190" y1="18" x2="225" y2="18"
              stroke={isDarkMode ? "#94a3b8" : "#64748b"}
              strokeWidth="0.5"
            />
            {/* Connection: Y to O */}
            <motion.line
              x1="240" y1="28" x2="260" y2="28"
              stroke={isDarkMode ? "#fbcfe8" : "#f472b6"}
              strokeWidth="0.75"
              strokeDasharray="3 3"
              animate={{ strokeDashoffset: [20, 0] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 6 }}
            />
          </g>

          {/* Core Wordmark Path for UPASYO */}
          <g>
            {/* Letter U */}
            <path
              d="M15,14 V38 C15,44 26,44 26,38 V14"
              stroke={isDarkMode ? "#ffffff" : "#09090b"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Letter P */}
            <path
              d="M50,42 V14 H66 C75,14 75,28 66,28 H50"
              stroke={isDarkMode ? "#ffffff" : "#09090b"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Letter A */}
            <path
              d="M92,42 L105,14 L118,42 M97,32 H113"
              stroke={isDarkMode ? "#ffffff" : "#09090b"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Letter S */}
            <path
              d="M140,17 C140,14 156,12 156,21 C156,29 138,26 138,34 C138,43 156,41 156,38"
              stroke={isDarkMode ? "#ffffff" : "#09090b"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Letter Y */}
            <path
              d="M180,14 L192,28 M204,14 L192,28 V42"
              stroke={isDarkMode ? "#ffffff" : "#09090b"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Letter O */}
            <circle
              cx="238" cy="28" r="14"
              stroke={isDarkMode ? "#ffffff" : "#09090b"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Pulsing Neural Nodes overlay */}
          <g>
            {/* Node 1 - U base */}
            <motion.circle
              cx="20.5" cy="40.5" r="3.5"
              fill={isDarkMode ? "#ffd3e2" : "#f472b6"}
              animate={{ r: [3.5, 5, 3.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            {/* Node 2 - P curve */}
            <motion.circle
              cx="66" cy="21" r="3"
              fill="#cbd5e1"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
            />
            {/* Node 3 - A apex */}
            <motion.circle
              cx="105" cy="14" r="4.5"
              fill={isDarkMode ? "#ffffff" : "#f472b6"}
              className="neural-brand-glow"
            />
            {/* Node 4 - S curve top */}
            <circle cx="140" cy="17" r="2.5" fill={isDarkMode ? "#cbd5e1" : "#09090b"} />
            {/* Node 5 - Y intersection */}
            <motion.circle
              cx="192" cy="28" r="3.5"
              fill={isDarkMode ? "#fbcfe8" : "#f472b6"}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />
            {/* Node 6 - O dynamic center */}
            <motion.circle
              cx="238" cy="28" r="4"
              fill={isDarkMode ? "#ffd3e2" : "#f472b6"}
              className="neural-brand-glow"
            />
          </g>
        </svg>

        {/* Accent floating subtitle node */}
        <div className="absolute -bottom-2 right-1.5 flex items-center gap-1 opacity-80 scale-75">
          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" />
          <span className="text-[9px] tracking-[0.25em] font-mono text-gray-400 dark:text-silver font-semibold uppercase">
            COG_BRAIN
          </span>
        </div>
      </motion.div>
    </div>
  );
}
