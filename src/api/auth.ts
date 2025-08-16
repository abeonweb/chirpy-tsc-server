import * as bcrypt from "bcrypt";
import { Request } from "express";
import pkg, { JwtPayload } from "jsonwebtoken";
import { PermissionError } from "./custom-errors.js";
const { sign, verify } = pkg;

export async function hashedPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function checkPasswordHash(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string
): string {
  const iat = Math.floor(Date.now() / 1000);
  const payload: payload = {
    iss: "chirpy",
    sub: userID,
    iat,
    exp: iat + expiresIn,
  };
  const token = sign(payload, secret);
  return token;
}

export function validateJWT(tokenString: string, secret: string) {
  let payload: JwtPayload;
  try {
    payload = verify(tokenString, secret) as JwtPayload;
  } catch (error) {
    throw new PermissionError("Invalid token");
  }
  if (payload.iss !== "chirpy") {
    throw new Error("Invalid issuer");
  }
  return payload.sub;
}

export function getBearerToken(req: Request) {
  const authorization = req.get("authorization");
  // console.log("authorization", authorization);
  if (!authorization) {
    throw new PermissionError("No token or authorization header found");
  }
  const token = authorization.split("Bearer ")[1];
  return token;
}

export async function makeRefreshToken() {
  const { randomBytes } = await import("node:crypto");
  const buf = randomBytes(32);
  return buf.toString("hex");
}
