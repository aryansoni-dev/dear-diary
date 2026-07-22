export function createRunOnce() {
  let hasRun = false;

  return {
    run(action: () => void) {
      if (hasRun) {
        return false;
      }

      action();
      hasRun = true;
      return true;
    },
  };
}
