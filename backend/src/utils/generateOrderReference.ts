import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateOrderReference = (): string => {
  let code = "";
  for (let i = 0; i < 8; i += 1) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `OP-${code}`;
};
