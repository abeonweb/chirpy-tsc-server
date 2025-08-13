import { asc } from "drizzle-orm";
import { db } from "../index.js";
import { type Chirp, chirps } from "../schema.js";

export async function addChirpByUserID(chirp: Chirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();
  return result;
}

export async function getChirps() {
  const result = await db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt));
  return result;
}
