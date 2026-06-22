export type ConnectivityStatus = "unknown" | "online" | "offline";

export type ConnectivityState = {
  connectionType: string | null;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  lastChangedAt: string | null;
  status: ConnectivityStatus;
};
