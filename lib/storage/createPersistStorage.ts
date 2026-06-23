import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

import { throwIfFaultEnabled } from "@/lib/dev/faultInjection";

export function createPersistStorage(): StateStorage {
  return {
    getItem: (name) => {
      throwIfFaultEnabled("async_storage_read_failure");
      return AsyncStorage.getItem(name);
    },
    removeItem: (name) => AsyncStorage.removeItem(name),
    setItem: (name, value) => {
      throwIfFaultEnabled("async_storage_write_failure");
      return AsyncStorage.setItem(name, value);
    },
  };
}

