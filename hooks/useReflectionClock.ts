import { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { getMillisecondsUntilNextReflectionChange } from "@/lib/reflection-prompts/dailyReflectionPrompts";

export function useReflectionClock() {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    let appState: AppStateStatus = AppState.currentState;
    let boundaryTimeout: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextChange = () => {
      if (boundaryTimeout) {
        clearTimeout(boundaryTimeout);
      }

      const now = new Date();
      boundaryTimeout = setTimeout(() => {
        setCurrentTime(new Date());
        scheduleNextChange();
      }, getMillisecondsUntilNextReflectionChange(now) + 50);
    };

    scheduleNextChange();

    const subscription = AppState.addEventListener("change", (nextState) => {
      const isReturningToForeground =
        appState !== "active" && nextState === "active";
      appState = nextState;

      if (isReturningToForeground) {
        setCurrentTime(new Date());
        scheduleNextChange();
      }
    });

    return () => {
      if (boundaryTimeout) {
        clearTimeout(boundaryTimeout);
      }

      subscription.remove();
    };
  }, []);

  return currentTime;
}
