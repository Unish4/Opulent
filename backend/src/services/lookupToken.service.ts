import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const secret = new TextEncoder().encode(ENV.LOOKUP.TOKEN_SECRET);
const ISSUER = "opulent-lookup";

export interface LookupClaims {
  gameId: string;
  playerId: string;
  serverId: string;
  playerName: string;
  level: number | null;
  region: string | null;
  provider: string;
}

export const signLookupToken = async (userId: string, claims: LookupClaims) => {
  const token = await new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${ENV.LOOKUP.TOKEN_TTL_SECONDS}s`)
    .sign(secret);

  return {
    token,
    expiresAt: new Date(Date.now() + ENV.LOOKUP.TOKEN_TTL_SECONDS * 1000),
  };
};

interface ExpectedBinding {
  userId: string;
  gameId: string;
  playerId: string;
  serverId: string;
}

// Used by order creation: the token must belong to this user and match the IDs being ordered.
export const verifyLookupToken = async (
  token: string,
  expected: ExpectedBinding,
): Promise<LookupClaims> => {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      subject: expected.userId,
      algorithms: ["HS256"],
    });
    const claims = payload as unknown as LookupClaims;

    if (
      claims.gameId !== expected.gameId ||
      claims.playerId !== expected.playerId ||
      claims.serverId !== expected.serverId
    ) {
      throw new Error("binding mismatch");
    }
    return claims;
  } catch {
    throw new ApiError(
      400,
      "The player check expired or does not match. Please check the player again.",
    );
  }
};
