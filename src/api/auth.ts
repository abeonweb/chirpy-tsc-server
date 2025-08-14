import * as bcrypt from "bcrypt";

export async function hashedPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function checkPasswordHash(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
