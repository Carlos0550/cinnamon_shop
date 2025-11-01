
export function useUtils() {
    const capitalizeTexts = (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
  return {
    capitalizeTexts
  }
}

