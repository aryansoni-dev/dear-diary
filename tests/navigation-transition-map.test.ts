import assert from "node:assert/strict";

// @ts-expect-error Node's built-in TypeScript runner requires an explicit extension.
import * as routeTransitionMap from "../navigation/route-transition-map.ts";

const {
  authRouteTransitions,
  bottomTabRouteTransitions,
  getRouteTransitionCategory,
  journalRouteTransitions,
  onboardingRouteTransitions,
  rootRouteTransitions,
  routeTransitionCategories,
  settingsRouteTransitions,
} = routeTransitionMap;

assert.equal(
  rootRouteTransitions.settings,
  routeTransitionCategories.standardDetail,
);
assert.equal(
  rootRouteTransitions.journal,
  routeTransitionCategories.writingFlow,
);
assert.equal(rootRouteTransitions.sso, routeTransitionCategories.sensitive);
assert.equal(authRouteTransitions.login, routeTransitionCategories.authBoundary);
assert.equal(
  onboardingRouteTransitions["onboarding-screen-3"],
  routeTransitionCategories.onboarding,
);
assert.equal(
  bottomTabRouteTransitions["home-tab/index"],
  routeTransitionCategories.bottomTab,
);
assert.equal(
  bottomTabRouteTransitions["journal-editor/index"],
  routeTransitionCategories.writingFlow,
);
assert.equal(journalRouteTransitions.new, routeTransitionCategories.writingFlow);
assert.equal(
  settingsRouteTransitions["app-lock/change-pin"],
  routeTransitionCategories.sensitive,
);
assert.equal(
  getRouteTransitionCategory("unknown-route"),
  routeTransitionCategories.standardDetail,
);

console.log("navigation transition map ok");
