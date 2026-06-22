import NetInfo, {
  type NetInfoState,
} from "@react-native-community/netinfo";
import {
  createContext,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ConnectivityState,
  ConnectivityStatus,
} from "@/types/connectivity";

const offlineConfirmationMs = 700;

const initialConnectivityState: ConnectivityState = {
  connectionType: null,
  isConnected: null,
  isInternetReachable: null,
  lastChangedAt: null,
  status: "unknown",
};

export const ConnectivityContext = createContext<ConnectivityState>(
  initialConnectivityState,
);

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [connectivity, setConnectivity] = useState<ConnectivityState>(
    initialConnectivityState,
  );
  const offlineTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearOfflineTimeout = () => {
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
        offlineTimeoutRef.current = null;
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      const nextState = getConnectivityState(state);

      if (nextState.status === "offline") {
        clearOfflineTimeout();
        offlineTimeoutRef.current = setTimeout(() => {
          setConnectivity((currentState) =>
            areConnectivityStatesEqual(currentState, nextState)
              ? currentState
              : nextState,
          );
        }, offlineConfirmationMs);
        return;
      }

      clearOfflineTimeout();
      setConnectivity((currentState) =>
        areConnectivityStatesEqual(currentState, nextState)
          ? currentState
          : nextState,
      );
    });

    return () => {
      clearOfflineTimeout();
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => connectivity, [connectivity]);

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
}

function getConnectivityState(state: NetInfoState): ConnectivityState {
  return {
    connectionType: state.type,
    isConnected: state.isConnected,
    isInternetReachable: state.isInternetReachable,
    lastChangedAt: new Date().toISOString(),
    status: getConnectivityStatus(state),
  };
}

function getConnectivityStatus(state: NetInfoState): ConnectivityStatus {
  const isConnected = state.isConnected;
  const isInternetReachable = state.isInternetReachable;

  if (isConnected === false || isInternetReachable === false) {
    return "offline";
  }

  if (isConnected === true) {
    return "online";
  }

  return "unknown";
}

function areConnectivityStatesEqual(
  left: ConnectivityState,
  right: ConnectivityState,
) {
  return (
    left.connectionType === right.connectionType &&
    left.isConnected === right.isConnected &&
    left.isInternetReachable === right.isInternetReachable &&
    left.status === right.status
  );
}
