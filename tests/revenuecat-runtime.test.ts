// @ts-expect-error Node's built-in TypeScript runner requires an explicit extension.
import { createKeyedRequestDeduper } from "../lib/subscription/requestDeduper.ts";
// @ts-expect-error Node's built-in TypeScript runner requires an explicit extension.
import { synchronizeRevenueCatIdentity } from "../lib/subscription/revenueCatIdentity.ts";
// @ts-expect-error Node's built-in TypeScript runner requires an explicit extension.
import { createRunOnce } from "../lib/subscription/runOnce.ts";
// @ts-expect-error Node's built-in TypeScript runner requires an explicit extension.
import { hasVerifiedEntitlement, isEntitlementEnvironmentAuthoritative, isRevenueCatIdentityCurrent } from "../lib/subscription/subscriptionState.ts";

type TestCustomerInfo = {
  entitlements: {
    active: Record<string, unknown>;
  };
  owner: string;
};

const entitlementId = "DearDiary Pro";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function customerInfo(owner: string, isPro: boolean): TestCustomerInfo {
  return {
    entitlements: {
      active: isPro ? { [entitlementId]: { isActive: true } } : {},
    },
    owner,
  };
}

async function run() {
  const configureGuard = createRunOnce();
  let configureCount = 0;

  configureGuard.run(() => {
    configureCount += 1;
  });
  configureGuard.run(() => {
    configureCount += 1;
  });
  assert(configureCount === 1, "RevenueCat must configure once per process.");

  let anonymousLogoutCount = 0;
  await synchronizeRevenueCatIdentity(
    {
      getAppUserID: async () => "$RCAnonymousID:example",
      getCustomerInfo: async () => customerInfo("anonymous", false),
      isAnonymous: async () => true,
      logIn: async () => undefined,
      logOut: async () => {
        anonymousLogoutCount += 1;
      },
    },
    null,
  );
  assert(
    anonymousLogoutCount === 0,
    "An anonymous RevenueCat customer must not be logged out again.",
  );

  let repeatedLoginCount = 0;
  const identifiedResult = await synchronizeRevenueCatIdentity(
    {
      getAppUserID: async () => "user-a",
      getCustomerInfo: async () => customerInfo("user-a", true),
      isAnonymous: async () => false,
      logIn: async () => {
        repeatedLoginCount += 1;
      },
      logOut: async () => undefined,
    },
    "user-a",
  );
  assert(repeatedLoginCount === 0, "An active Clerk user must be identified once.");
  assert(
    identifiedResult.customerInfo?.owner === "user-a",
    "Identity synchronization must refresh CustomerInfo for the active user.",
  );

  let currentRevenueCatUser = "user-a";
  let accountSwitchLoginCount = 0;
  let accountSwitchLogoutCount = 0;
  const switchedResult = await synchronizeRevenueCatIdentity(
    {
      getAppUserID: async () => currentRevenueCatUser,
      getCustomerInfo: async () => customerInfo(currentRevenueCatUser, false),
      isAnonymous: async () => false,
      logIn: async (nextUserId) => {
        accountSwitchLoginCount += 1;
        currentRevenueCatUser = nextUserId;
      },
      logOut: async () => {
        accountSwitchLogoutCount += 1;
      },
    },
    "user-b",
  );
  assert(accountSwitchLoginCount === 1, "Account switching must identify User B once.");
  assert(
    accountSwitchLogoutCount === 0,
    "A direct identified account switch must not create an anonymous transition.",
  );
  assert(
    switchedResult.customerInfo?.owner === "user-b",
    "Account switching must publish only User B CustomerInfo.",
  );

  assert(
    !isRevenueCatIdentityCurrent({
      activeUserId: "user-b",
      revenueCatUserId: "user-a",
      synchronizedUserId: null,
    }),
    "An account transition must reject stale User A subscription updates.",
  );
  assert(
    !hasVerifiedEntitlement({
      customerInfo: customerInfo("user-a", true),
      entitlementId,
      identityMatches: false,
      isAuthoritative: true,
    }),
    "User A Plus must never be shown for User B.",
  );

  const deduper = createKeyedRequestDeduper<string>();
  let resolveOffering: (value: string) => void = () => {
    throw new Error("The offering request was not initialized.");
  };
  let offeringRequestCount = 0;
  const firstOfferingRequest = deduper.run("test-store:user-a", () => {
    offeringRequestCount += 1;
    return new Promise<string>((resolve) => {
      resolveOffering = resolve;
    });
  });
  const secondOfferingRequest = deduper.run("test-store:user-a", async () => {
    offeringRequestCount += 1;
    return "unexpected";
  });
  assert(
    firstOfferingRequest === secondOfferingRequest,
    "Concurrent offering consumers must share one request.",
  );
  assert(offeringRequestCount === 1, "Only one initial offering request may run.");
  resolveOffering("offering");
  await firstOfferingRequest;

  const retryDeduper = createKeyedRequestDeduper<string>();
  let failedOfferingRequestCount = 0;
  const failedRequest = () =>
    retryDeduper.run("google-play:user-a", async () => {
      failedOfferingRequestCount += 1;
      throw new Error("unavailable");
    });
  await Promise.allSettled([failedRequest(), failedRequest()]);
  assert(
    failedOfferingRequestCount === 1,
    "A failed offering request must not create a concurrent request loop.",
  );
  const explicitRetry = await retryDeduper.run(
    "google-play:user-a",
    async () => {
      failedOfferingRequestCount += 1;
      return "recovered";
    },
  );
  assert(
    explicitRetry === "recovered" &&
      Number(failedOfferingRequestCount) === 2,
    "Network recovery must allow an explicit offering retry.",
  );

  assert(
    hasVerifiedEntitlement({
      customerInfo: customerInfo("user-a", true),
      entitlementId,
      identityMatches: true,
      isAuthoritative: true,
    }),
    "A successful purchase must require the intended active entitlement.",
  );
  assert(
    !hasVerifiedEntitlement({
      customerInfo: customerInfo("user-a", false),
      entitlementId,
      identityMatches: true,
      isAuthoritative: true,
    }),
    "A cancelled purchase must not grant Plus.",
  );
  assert(
    !hasVerifiedEntitlement({
      customerInfo: null,
      entitlementId,
      identityMatches: true,
      isAuthoritative: true,
    }),
    "A failed purchase must not grant Plus.",
  );
  assert(
    !hasVerifiedEntitlement({
      customerInfo: customerInfo("user-a", false),
      entitlementId,
      identityMatches: true,
      isAuthoritative: true,
    }),
    "Restore must require a verified active entitlement.",
  );

  const expiredAccess = hasVerifiedEntitlement({
    customerInfo: customerInfo("user-a", false),
    entitlementId,
    identityMatches: true,
    isAuthoritative: true,
  });
  assert(!expiredAccess, "An expired entitlement must remove Plus access.");
  assert(
    !hasVerifiedEntitlement({
      customerInfo: null,
      entitlementId,
      identityMatches: false,
      isAuthoritative: true,
    }),
    "RevenueCat unavailability must fail closed without affecting journaling data.",
  );
  assert(
    !isEntitlementEnvironmentAuthoritative("storeClient"),
    "Expo Go Preview API mode must not be authoritative entitlement proof.",
  );
}

void run();
