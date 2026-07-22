export type RevenueCatIdentitySdk<CustomerInfo> = {
  getAppUserID: () => Promise<string>;
  getCustomerInfo: () => Promise<CustomerInfo>;
  isAnonymous: () => Promise<boolean>;
  logIn: (appUserId: string) => Promise<unknown>;
  logOut: () => Promise<unknown>;
};

export type RevenueCatIdentityResult<CustomerInfo> =
  | {
      appUserId: string;
      customerInfo: CustomerInfo;
    }
  | {
      appUserId: null;
      customerInfo: null;
    };

export async function synchronizeRevenueCatIdentity<CustomerInfo>(
  sdk: RevenueCatIdentitySdk<CustomerInfo>,
  clerkUserId: string | null,
): Promise<RevenueCatIdentityResult<CustomerInfo>> {
  if (!clerkUserId) {
    const isAnonymous = await sdk.isAnonymous();

    if (!isAnonymous) {
      await sdk.logOut();
    }

    return {
      appUserId: null,
      customerInfo: null,
    };
  }

  const currentAppUserId = await sdk.getAppUserID();

  if (currentAppUserId !== clerkUserId) {
    await sdk.logIn(clerkUserId);
  }

  const synchronizedAppUserId = await sdk.getAppUserID();

  if (synchronizedAppUserId !== clerkUserId) {
    throw new Error("RevenueCat identity synchronization did not complete.");
  }

  return {
    appUserId: clerkUserId,
    customerInfo: await sdk.getCustomerInfo(),
  };
}
