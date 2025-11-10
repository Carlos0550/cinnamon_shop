'use client'

import { useEffect, useState } from "react";

export function useUtils() {
    const [baseUrl, setBaseUrl] = useState("");
    const capitalizeTexts = (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    useEffect(() => {
      console.log("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);
      setBaseUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api");
    },[])
  return {
    baseUrl,
    capitalizeTexts
  }
}

