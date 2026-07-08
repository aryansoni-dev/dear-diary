export const routeTransitionCategories = {
  authBoundary: "authBoundary",
  bottomTab: "bottomTab",
  onboarding: "onboarding",
  sensitive: "sensitive",
  standardDetail: "standardDetail",
  writingFlow: "writingFlow",
} as const;

export type RouteTransitionCategory =
  (typeof routeTransitionCategories)[keyof typeof routeTransitionCategories];

export const rootRouteTransitions = {
  "(auth)": routeTransitionCategories.authBoundary,
  "(onboarding)": routeTransitionCategories.authBoundary,
  "(tabs)": routeTransitionCategories.authBoundary,
  "achievements/index": routeTransitionCategories.standardDetail,
  index: routeTransitionCategories.authBoundary,
  "insights/report/[periodType]": routeTransitionCategories.standardDetail,
  journal: routeTransitionCategories.writingFlow,
  "legal/privacy-policy": routeTransitionCategories.standardDetail,
  "legal/terms": routeTransitionCategories.standardDetail,
  settings: routeTransitionCategories.standardDetail,
  sso: routeTransitionCategories.sensitive,
  "sso-callback": routeTransitionCategories.sensitive,
} as const satisfies Record<string, RouteTransitionCategory>;

export const onboardingRouteTransitions = {
  "onboarding-screen-1": routeTransitionCategories.onboarding,
  "onboarding-screen-2": routeTransitionCategories.onboarding,
  "onboarding-screen-3": routeTransitionCategories.onboarding,
  "onboarding-screen-4": routeTransitionCategories.onboarding,
  "onboarding-screen-5": routeTransitionCategories.onboarding,
} as const satisfies Record<string, RouteTransitionCategory>;

export const authRouteTransitions = {
  login: routeTransitionCategories.authBoundary,
  "reset-passwd": routeTransitionCategories.authBoundary,
  signup: routeTransitionCategories.authBoundary,
} as const satisfies Record<string, RouteTransitionCategory>;

export const bottomTabRouteTransitions = {
  "ai-chat/index": routeTransitionCategories.bottomTab,
  "home-tab/index": routeTransitionCategories.bottomTab,
  "insights-tab/index": routeTransitionCategories.bottomTab,
  "journal-editor/index": routeTransitionCategories.writingFlow,
  "journal-history/index": routeTransitionCategories.bottomTab,
  "profile-notifications/index": routeTransitionCategories.bottomTab,
  "profile-tab/index": routeTransitionCategories.bottomTab,
  "reflect-tab/index": routeTransitionCategories.bottomTab,
} as const satisfies Record<string, RouteTransitionCategory>;

export const journalRouteTransitions = {
  "[id]": routeTransitionCategories.writingFlow,
  new: routeTransitionCategories.writingFlow,
} as const satisfies Record<string, RouteTransitionCategory>;

export const settingsRouteTransitions = {
  "app-lock/change-pin": routeTransitionCategories.sensitive,
  "app-lock/setup": routeTransitionCategories.sensitive,
  privacy: routeTransitionCategories.standardDetail,
} as const satisfies Record<string, RouteTransitionCategory>;

export function getRouteTransitionCategory(
  routeName: string,
): RouteTransitionCategory {
  const routeMaps = [
    rootRouteTransitions,
    onboardingRouteTransitions,
    authRouteTransitions,
    bottomTabRouteTransitions,
    journalRouteTransitions,
    settingsRouteTransitions,
  ] as const;

  for (const routeMap of routeMaps) {
    if (routeName in routeMap) {
      return routeMap[routeName as keyof typeof routeMap];
    }
  }

  return routeTransitionCategories.standardDetail;
}
