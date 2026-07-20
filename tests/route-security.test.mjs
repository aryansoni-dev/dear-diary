import assert from "node:assert/strict";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { RouteSecurityBoundary } from "../components/navigation/route-security-boundary.ts";
import {
  isPublicRoute,
  resolveProtectedRouteAccess,
} from "../lib/navigation/route-security.ts";

const signedInUnlockedState = {
  activeUserId: "user_active",
  appLockStatus: "unlocked",
  authLoaded: true,
  authUserId: "user_active",
  clerkUserId: "user_active",
  clerkUserLoaded: true,
  isSignedIn: true,
  journalEntries: [],
  pathname: "/settings",
  userScopedStorageHydrated: true,
};

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    activeUserId: null,
    authUserId: null,
    clerkUserId: null,
    isSignedIn: false,
  }),
  { type: "authenticate" },
  "Signed-out Settings deep links must resolve to Auth.",
);

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    activeUserId: null,
    authUserId: null,
    clerkUserId: null,
    isSignedIn: false,
    pathname: "/journal/entry-1",
  }),
  { type: "authenticate" },
  "Signed-out journal deep links must resolve to Auth.",
);

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    authLoaded: false,
  }),
  { type: "loading" },
  "Protected routes must stay behind the opaque gate while Clerk loads.",
);

assert.deepEqual(
  resolveProtectedRouteAccess(signedInUnlockedState),
  { type: "allow" },
  "Signed-in, hydrated, unlocked users must be allowed to open Settings.",
);

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    activeUserId: null,
    appLockStatus: "locked",
  }),
  { type: "unlock" },
  "Locked Settings deep links must resolve to App Lock.",
);

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    activeUserId: null,
    appLockStatus: "locked",
    pathname: "/journal/nonexistent",
  }),
  { type: "unlock" },
  "Locked journal deep links must show App Lock before validating the ID.",
);

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    pathname: "/journal/nonexistent",
  }),
  { href: "/journal-history", type: "redirect" },
  "An unowned journal ID must fail safely to Journal History.",
);

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    journalEntries: [
      {
        id: "entry-1",
        userId: "different-user",
      },
    ],
    pathname: "/journal/entry-1",
  }),
  { href: "/journal-history", type: "redirect" },
  "A journal ID owned by another user must not open.",
);

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    journalEntries: [
      {
        id: "entry-1",
        userId: "user_active",
      },
    ],
    pathname: "/journal/entry-1",
  }),
  { type: "allow" },
  "An owned journal route may open after every security state resolves.",
);

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    activeUserId: "previous-user",
    authUserId: "next-user",
    clerkUserId: "next-user",
  }),
  { type: "loading" },
  "An account switch must block the old route until the new user is active.",
);

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    activeUserId: null,
    authUserId: null,
    clerkUserId: null,
    isSignedIn: false,
  }),
  { type: "authenticate" },
  "Sign-out must not retain or replay a protected route.",
);

assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    activeUserId: null,
    authUserId: null,
    clerkUserId: null,
    isSignedIn: false,
    pathname: "/journal/entry-1",
  }),
  { type: "authenticate" },
  "Account deletion and sign-out must leave no replayable journal route.",
);

const invalidCallbackState = {
  ...signedInUnlockedState,
  activeUserId: null,
  authUserId: null,
  clerkUserId: null,
  isSignedIn: false,
  pathname: "/sso-callback",
};

assert.deepEqual(
  resolveProtectedRouteAccess(invalidCallbackState),
  { type: "allow" },
  "The Clerk callback surface must remain public without granting protected access.",
);
assert.equal(
  invalidCallbackState.authUserId,
  null,
  "Route resolution must never create or change a Clerk session.",
);

assert.equal(isPublicRoute("/legal/privacy-policy"), true);
assert.equal(isPublicRoute("/legal/terms"), true);
assert.deepEqual(
  resolveProtectedRouteAccess({
    ...signedInUnlockedState,
    activeUserId: null,
    authLoaded: false,
    authUserId: null,
    clerkUserId: null,
    clerkUserLoaded: false,
    isSignedIn: false,
    pathname: "/legal/privacy-policy",
    userScopedStorageHydrated: false,
  }),
  { type: "allow" },
  "The public Privacy Policy must remain reachable while signed out.",
);

let protectedScreenRenderCount = 0;

function ProtectedScreen() {
  protectedScreenRenderCount += 1;
  return createElement("div", null, "Protected settings");
}

function renderBoundary(decision) {
  return renderToStaticMarkup(
    createElement(
      RouteSecurityBoundary,
      {
        authenticationFallback: createElement("div", null, "Auth"),
        decision,
        loadingFallback: createElement("div", null, "Loading"),
        lockedFallback: createElement("div", null, "App Lock"),
        redirectFallback: createElement("div", null, "Safe fallback"),
      },
      createElement(ProtectedScreen),
    ),
  );
}

renderBoundary({ type: "loading" });
renderBoundary({ type: "authenticate" });
renderBoundary({ type: "unlock" });
renderBoundary({ href: "/home-tab", type: "redirect" });
assert.equal(
  protectedScreenRenderCount,
  0,
  "Protected screen components must not render behind any security fallback.",
);

renderBoundary({ type: "allow" });
assert.equal(
  protectedScreenRenderCount,
  1,
  "Protected screen components may render only after the gate allows access.",
);

console.log("route security gate ok");
