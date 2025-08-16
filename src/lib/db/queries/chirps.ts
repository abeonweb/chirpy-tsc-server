import { and, asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { type Chirp, chirps } from "../schema.js";

export async function addChirpByUserID(chirp: Chirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();
  return result;
}

export async function getChirps() {
  const result = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
  return result;
}

export async function getChirpByUserId(userId: string, chirpID: string) {
  const [result] = await db
    .select()
    .from(chirps)
    .where(and(eq(chirps.userId, userId), eq(chirps.id, chirpID)));
  return result;
}

export async function getChirpById(chirpId: string) {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
  return result;
}

export async function deleteChirpById(chirpID: string) {
  const [result] = await db
    .delete(chirps)
    .where(eq(chirps.id, chirpID))
    .returning({ deletedId: chirps.id });
  return result;
}
