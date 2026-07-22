export function createKeyedRequestDeduper<Result>() {
  const activeRequests = new Map<string, Promise<Result>>();

  return {
    run(key: string, request: () => Promise<Result>) {
      const activeRequest = activeRequests.get(key);

      if (activeRequest) {
        return activeRequest;
      }

      const nextRequest = request().finally(() => {
        if (activeRequests.get(key) === nextRequest) {
          activeRequests.delete(key);
        }
      });

      activeRequests.set(key, nextRequest);
      return nextRequest;
    },
  };
}
