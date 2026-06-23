export function assertActiveUser(
  expectedUserId: string,
  actualUserId: string | null,
): void {
  if (expectedUserId !== actualUserId) {
    throw new Error("Active user changed before the operation completed.");
  }
}

export function isActiveUser(
  expectedUserId: string,
  actualUserId: string | null,
): boolean {
  return expectedUserId === actualUserId;
}

