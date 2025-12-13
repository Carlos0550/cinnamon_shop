'use client'

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useUtils() {
    const [baseUrl] = useState(() => {
        const api = process.env.NEXT_PUBLIC_API_URL
        if (api && api.trim()) return api
        const site = process.env.NEXT_PUBLIC_SITE_URL
        try {
            const origin = site ? new URL(site).origin : "http://localhost:3001"
            return `${origin.replace(/\/+$/, '')}/api`
        } catch {
            return "http://localhost:3000/api"
        }
    });
    const [isMobile, setIsMobile] = useState(false);

    const [windowWidth, setWindowWidth] = useState<number>(1024);
    const capitalizeTexts = (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    const queryClient = useQueryClient();

    useEffect(() => {
        const checkIsMobile = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            setIsMobile(width <= 788);
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
    windowWidth,
    queryClient,
  }
}
