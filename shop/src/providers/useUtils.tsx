'use client'

import { useEffect, useState } from "react";

export function useUtils() {
    const [baseUrl] = useState(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api");
    const [isMobile, setIsMobile] = useState(false);
    // Use a stable initial width to match server and client on first render
    const [windowWidth, setWindowWidth] = useState<number>(1024);
    const capitalizeTexts = (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    useEffect(() => {
        const checkIsMobile = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            setIsMobile(width <= 768);
        }
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => {
            window.removeEventListener("resize", checkIsMobile);
        }
    },[])
  return {
    baseUrl,
    capitalizeTexts,
    isMobile,
    windowWidth
  }
}

