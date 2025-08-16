import {
  createRefreshToken,
  updateTokenRevokedAt,
} from "../../lib/db/queries/refresh-token.js";
import { RefreshToken } from "../../lib/db/schema.js";
import { makeRefreshToken } from "../auth.js";

export async function addRefreshTokenToDB(userId: string) {
  const token = await makeRefreshToken();
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const values: RefreshToken = {
    token,
    userId,
    expiresAt,
  };
  const result = await createRefreshToken(values);
  return result;
}

export async function revokeToken(token: string) {
  const revokedAt = new Date();
  await updateTokenRevokedAt(token, { revokedAt });
}
