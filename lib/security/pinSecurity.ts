import * as Crypto from "expo-crypto";

const pinPattern = /^\d{6}$/;

export const isValidPin = (pin: string): boolean => pinPattern.test(pin);

export const generatePinSalt = async (): Promise<string> => {
  const saltBytes = await Crypto.getRandomBytesAsync(24);

  return Array.from(saltBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const createPinHash = async (
  pin: string,
  salt: string,
): Promise<string> => {
  const versionedInput = `deardiary-pin-v1:${salt}:${pin}`;

  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    versionedInput,
  );
};

export const verifyPin = async (
  pin: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> => {
  if (!isValidPin(pin)) {
    return false;
  }

  const pinHash = await createPinHash(pin, salt);

  return pinHash === expectedHash;
};

