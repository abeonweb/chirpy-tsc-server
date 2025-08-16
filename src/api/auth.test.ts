import { describe, it, expect, beforeAll, vi } from "vitest";
import {
  checkPasswordHash,
  getBearerToken,
  hashedPassword,
  makeJWT,
  payload,
  validateJWT,
} from "./auth";

describe("Password Hashing", () => {
  const password1 = "correctPasssword123!";
  const password2 = "anotherPasssword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashedPassword(password1);
    hash2 = await hashedPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT validating", () => {
  const values1 = {
    userID: "1589d1-we7s8fs-414r6a-rr128d",
    expiresIn: 5 * 60,
    secret: "break",
  };
  const values2 = {
    userID: "150081-ac732fs-90d12j-6av1jj",
    expiresIn: 15 * 60,
    secret: "restless",
  };
  let token1: string;
  let token2: string;
  beforeAll(() => {
    token1 = makeJWT(values1.userID, values1.expiresIn, values1.secret);
    token2 = makeJWT(values2.userID, values2.expiresIn, values2.secret);
  });

  it("should return a valid user id", () => {
    const result = validateJWT(token1, values1.secret);
    const result2 = validateJWT(token2, values2.secret);

    expect(result === values1.userID).toBe(true);
    expect(result2 === values2.userID).toBe(true);
  });
});

// describe("Get authorization token string", ()=>{
//     vi.fn()
//     let token: string;
//     beforeAll(()=>{
//         token = getBearerToken()
//     })
// })