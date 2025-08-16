import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}

export async function updateUserById(
  id: string,
  values: { email: string; hashedPassword: string }
) {
  const [result] = await db
    .update(users)
    .set(values)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      createdAt: users.createdAt,
      email: users.email,
      updatedAt: users.updatedAt,
    });
  return result;
}

export async function deleteUsers() {
  await db.delete(users);
}
