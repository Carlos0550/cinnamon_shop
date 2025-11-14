import { useEffect, useState } from "react";

export function useUtils() {
  const [width, setWidth] = useState(window.innerWidth)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const capitalizeTexts = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }


  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    setIsMobile(width <= 768)
  }, [width])
  return {
    capitalizeTexts,
    isMobile,
    width
  }
}

