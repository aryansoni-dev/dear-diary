import { useContext } from "react";

import { ConnectivityContext } from "@/providers/ConnectivityProvider";

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
