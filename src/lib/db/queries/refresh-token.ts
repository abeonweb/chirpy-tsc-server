import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { RefreshToken, refreshTokens } from "../schema.js";

export async function createRefreshToken(refresh: RefreshToken) {
  const [result] = await db.insert(refreshTokens).values(refresh).returning();
  return result;
}

export async function getUserFromRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));
  return result;
}

export async function updateTokenRevokedAt(
  token: string,
  values: { revokedAt: Date }
) {
  const [result] = await db
    .update(refreshTokens)
    .set(values)
    .where(eq(refreshTokens.token, token))
    .returning();
  return result;
}
