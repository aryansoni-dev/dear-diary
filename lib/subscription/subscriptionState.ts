export type CustomerInfoWithEntitlements = {
  entitlements: {
    active: Record<string, unknown>;
  };
};

export function hasVerifiedEntitlement(params: {
  customerInfo: CustomerInfoWithEntitlements | null;
  entitlementId: string;
  identityMatches: boolean;
  isAuthoritative: boolean;
}) {
  return Boolean(
    params.isAuthoritative &&
      params.identityMatches &&
      params.customerInfo?.entitlements.active[params.entitlementId],
  );
}

export function isEntitlementEnvironmentAuthoritative(
  executionEnvironment: string,
) {
  return executionEnvironment !== "storeClient";
}

export function isRevenueCatIdentityCurrent(params: {
  activeUserId: string | null;
  revenueCatUserId: string | null;
  synchronizedUserId: string | null;
}) {
  return Boolean(
    params.activeUserId &&
      params.activeUserId === params.revenueCatUserId &&
      params.activeUserId === params.synchronizedUserId,
  );
}
