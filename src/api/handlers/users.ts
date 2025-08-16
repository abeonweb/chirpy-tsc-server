import type { NextFunction, Request, Response } from "express";
import { CreateUserError, PermissionError } from "../custom-errors.js";
import {
  createUser,
  deleteUsers,
  getUserByEmail,
  updateUserById,
} from "../../lib/db/queries/users.js";
import { config } from "../../config.js";
import {
  checkPasswordHash,
  getBearerToken,
  hashedPassword,
  makeJWT,
  makeRefreshToken,
  validateJWT,
} from "../auth.js";
import { NewUser, UserResponse } from "../../../src/lib/db/schema.js";
import { respondWithJson, respondWithJsonError } from "../json-response.js";
import { addRefreshTokenToDB, revokeToken } from "./refresh.js";
import { getUserFromRefreshToken } from "../../lib/db/queries/refresh-token.js";

export type UserParameter = {
  email: string;
  password: string;
  // expiresInSeconds?: number;
};

export const handlerCreateUser = async (req: Request, res: Response) => {
  const data: UserParameter = req?.body;

  if (!data?.email || !data.password) {
    throw new CreateUserError("Invalid email and/or password entered");
  }
  const hash = await hashedPassword(data.password);
  const result = await createUser({
    email: data.email,
    hashedPassword: hash,
  });
  const payload: UserResponse = {
    id: result.id,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    email: result.email,
  };
  respondWithJson(res, 201, payload);
};

const DEFAULT_TOKEN_EXPIRE = 3600;

export const handlerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const params: UserParameter = req.body;

  try {
    const result = await getUserByEmail(params.email);
    if (!result) {
      respondWithJsonError(res, 401, "Unauthorized");
      return;
    }
    const isValidPassword = await checkPasswordHash(
      params.password,
      result.hashedPassword
    );
    if (!isValidPassword) {
      respondWithJsonError(res, 401, "Unauthorized");
      return;
    }
    const token = makeJWT(result?.id, DEFAULT_TOKEN_EXPIRE, config.jwtSecret);

    const refreshToken = await addRefreshTokenToDB(result.id);
    if (!refreshToken) {
      throw new Error("Could not add refresh token to database.");
    }

    const responseWithToken = {
      id: result.id,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      email: result.email,
      token,
      refreshToken: refreshToken.token,
    };
    respondWithJson(res, 200, responseWithToken);
  } catch (error) {
    next(error);
  }
};

export async function handlerRefresh(req: Request, res: Response) {
  const refresh = getBearerToken(req);
  if (!refresh) throw new Error("Refresh token not found");
  const result = await getUserFromRefreshToken(refresh);
  const currentTime = Date.now();
  if (!result || result.expiresAt.getTime() < currentTime || result.revokedAt) {
    respondWithJsonError(res, 401, "Token not found, expired or revoked");
  } else {
    const token = makeJWT(
      result.userId,
      DEFAULT_TOKEN_EXPIRE,
      config.jwtSecret
    );
    respondWithJson(res, 200, { token });
  }
}

export async function handlerRevoke(req: Request, res: Response) {
  const refresh = getBearerToken(req);
  if (!refresh) throw new Error("Refresh token not found");
  await revokeToken(refresh);
  res.status(204).end();
}

export async function handlerUpdateUser(req: Request, res: Response) {
  const accessToken = getBearerToken(req);
  if (!accessToken) {
    throw new PermissionError("Invalid access token");
  }
  const userId = validateJWT(accessToken, config.jwtSecret);
  if (!userId) {
    throw new PermissionError("User not found");
  }
  const { email, password }: UserParameter = req?.body;

  const hashPassword: string = await hashedPassword(password);
  const values = {
    email: email,
    hashedPassword: hashPassword,
  };
  const updateResult = await updateUserById(userId, values);
  respondWithJson(res, 200, updateResult);
}
