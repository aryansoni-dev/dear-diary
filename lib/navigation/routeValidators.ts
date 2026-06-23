export function getSingleRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function isSafeRouteId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= 160 &&
    !value.includes("/") &&
    !value.includes("\\")
  );
}

export function getSafeRouteId(value: string | string[] | undefined) {
  const routeId = getSingleRouteParam(value);

  return isSafeRouteId(routeId) ? routeId : null;
}

