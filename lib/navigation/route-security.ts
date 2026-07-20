export type AppSecurityStatus =
  | "checking"
  | "disabled"
  | "locked"
  | "unlocked";

export type ProtectedRouteDecision =
  | { type: "allow" }
  | { type: "authenticate" }
  | { type: "loading" }
  | { type: "unlock" }
  | { href: "/home-tab" | "/journal-history"; type: "redirect" };

type JournalEntryOwner = {
  deletedAt?: string | null;
  id: string;
  userId: string;
};

export type ProtectedRouteState = {
  activeUserId: string | null;
  appLockStatus: AppSecurityStatus;
  authLoaded: boolean;
  authUserId: string | null;
  clerkUserId: string | null;
  clerkUserLoaded: boolean;
  isSignedIn: boolean;
  journalEntries: JournalEntryOwner[];
  pathname: string;
  userScopedStorageHydrated: boolean;
};

type RouteDescriptor =
  | { access: "public"; valid: true }
  | { access: "protected"; valid: boolean }
  | {
      access: "protected";
      journalEntryId: string;
      valid: true;
    };

const publicRoutes = new Set([
  "/",
  "/legal/privacy-policy",
  "/legal/terms",
  "/login",
  "/reset-passwd",
  "/signup",
  "/sso",
  "/sso-callback",
]);

const protectedRoutes = new Set([
  "/achievements",
  "/ai-chat",
  "/home-tab",
  "/home-tab/index",
  "/insights-tab",
  "/insights-tab/index",
  "/journal-editor",
  "/journal-editor/index",
  "/journal-history",
  "/journal-history/index",
  "/paywall",
  "/profile-notifications",
  "/profile-notifications/index",
  "/profile-tab",
  "/profile-tab/index",
  "/reflect-tab",
  "/reflect-tab/index",
  "/settings",
  "/settings/app-lock/change-pin",
  "/settings/app-lock/setup",
  "/settings/privacy",
]);

const onboardingRoutePattern = /^\/onboarding-screen-[1-5]$/;
const insightReportRoutePattern = /^\/insights\/report\/(weekly|monthly)$/;

export function resolveProtectedRouteAccess(
  state: ProtectedRouteState,
): ProtectedRouteDecision {
  const route = describeRoute(state.pathname);

  if (route.access === "public" && !state.isSignedIn) {
    return { type: "allow" };
  }

  if (!state.authLoaded) {
    return { type: "loading" };
  }

  if (!state.isSignedIn || !state.authUserId) {
    return route.access === "public"
      ? { type: "allow" }
      : { type: "authenticate" };
  }

  if (
    !state.clerkUserLoaded ||
    !state.clerkUserId ||
    state.clerkUserId !== state.authUserId
  ) {
    return { type: "loading" };
  }

  if (!state.userScopedStorageHydrated) {
    return { type: "loading" };
  }

  if (state.appLockStatus === "checking") {
    return { type: "loading" };
  }

  if (state.appLockStatus === "locked") {
    return { type: "unlock" };
  }

  if (state.activeUserId !== state.authUserId) {
    return { type: "loading" };
  }

  if (!route.valid) {
    return { href: "/home-tab", type: "redirect" };
  }

  if ("journalEntryId" in route) {
    const ownsEntry = state.journalEntries.some(
      (entry) =>
        entry.id === route.journalEntryId &&
        entry.userId === state.authUserId &&
        !entry.deletedAt,
    );

    if (!ownsEntry) {
      return { href: "/journal-history", type: "redirect" };
    }
  }

  return { type: "allow" };
}

export function isPublicRoute(pathname: string) {
  return describeRoute(pathname).access === "public";
}

function describeRoute(pathname: string): RouteDescriptor {
  const normalizedPathname = normalizePathname(pathname);

  if (
    publicRoutes.has(normalizedPathname) ||
    onboardingRoutePattern.test(normalizedPathname)
  ) {
    return { access: "public", valid: true };
  }

  if (
    protectedRoutes.has(normalizedPathname) ||
    insightReportRoutePattern.test(normalizedPathname) ||
    normalizedPathname === "/journal/new"
  ) {
    return { access: "protected", valid: true };
  }

  const journalEntryId = getJournalEntryId(normalizedPathname);

  if (journalEntryId) {
    return { access: "protected", journalEntryId, valid: true };
  }

  return { access: "protected", valid: false };
}

function normalizePathname(pathname: string) {
  const pathWithoutQuery = pathname.split(/[?#]/, 1)[0] ?? "/";

  if (pathWithoutQuery.length > 1 && pathWithoutQuery.endsWith("/")) {
    return pathWithoutQuery.slice(0, -1);
  }

  return pathWithoutQuery || "/";
}

function getJournalEntryId(pathname: string) {
  const match = /^\/journal\/([^/]+)$/.exec(pathname);

  if (!match?.[1] || match[1] === "new") {
    return null;
  }

  try {
    const entryId = decodeURIComponent(match[1]);

    if (
      !entryId.trim() ||
      entryId.length > 160 ||
      entryId.includes("/") ||
      entryId.includes("\\")
    ) {
      return null;
    }

    return entryId;
  } catch {
    return null;
  }
}
