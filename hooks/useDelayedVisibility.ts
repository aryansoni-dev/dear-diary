import { useEffect, useState } from "react";

export function useDelayedVisibility(visible: boolean, delayMs = 200): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, visible]);

  return isVisible;
}
