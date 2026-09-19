import React, { useState, useEffect } from "react";

interface TypewriterProps {
  texts: string | string[];
  delay?: number; // Delay between characters in ms
  period?: number; // Delay before erasing or typing next string in ms
  className?: string;
  loop?: boolean;
}

export default function Typewriter({
  texts,
  delay = 80,
  period = 2000,
  className = "",
  loop = true,
}: TypewriterProps) {
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Normalize texts into an array of strings
  const items = Array.isArray(texts) ? texts : [texts];

  useEffect(() => {
    if (items.length === 0) return;

    let timer: NodeJS.Timeout;
    const fullText = items[textIndex % items.length];

    if (isDeleting) {
      // Deleting speed is slightly faster
      timer = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      }, delay / 1.8);
    } else {
      timer = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }, delay);
    }

    // Finished typing full word
    if (!isDeleting && currentText === fullText) {
      if (items.length === 1 && !loop) {
        // Stop if only 1 text and no loop
        return;
      }
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, period);
    } 
    // Finished deleting
    else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      if (items.length === 1 && !loop) {
        // Stop if only 1 text and loop is false
        return;
      }
      setTextIndex((prev) => prev + 1);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, textIndex, items, delay, period, loop]);

  return (
    <span className={`inline-block select-text ${className}`}>
      {currentText}
      <span 
        className="inline-block w-[2.5px] h-[1.1em] bg-brand-accent-pink ml-1.5 animate-pulse" 
        style={{ verticalAlign: "middle" }}
      />
    </span>
  );
}
