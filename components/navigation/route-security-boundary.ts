import type { ReactNode } from "react";

import type { ProtectedRouteDecision } from "@/lib/navigation/route-security";

type RouteSecurityBoundaryProps = {
  authenticationFallback: ReactNode;
  children: ReactNode;
  decision: ProtectedRouteDecision;
  loadingFallback: ReactNode;
  lockedFallback: ReactNode;
  redirectFallback: ReactNode;
};

export function RouteSecurityBoundary({
  authenticationFallback,
  children,
  decision,
  loadingFallback,
  lockedFallback,
  redirectFallback,
}: RouteSecurityBoundaryProps): ReactNode {
  switch (decision.type) {
    case "allow":
      return children;
    case "authenticate":
      return authenticationFallback;
    case "loading":
      return loadingFallback;
    case "redirect":
      return redirectFallback;
    case "unlock":
      return lockedFallback;
  }
}
