'use client'

import { useState } from "react";

export function useUtils() {
    const [baseUrl] = useState(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api");
    const capitalizeTexts = (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
  return {
    baseUrl,
    capitalizeTexts
  }
}

