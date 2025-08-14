import type { NextFunction, Request, Response } from "express";
import { CreateUserError } from "../custom-errors.js";
import {
  createUser,
  deleteUsers,
  getUserByEmail,
} from "../../lib/db/queries/users.js";
import { config } from "../../config.js";
import { checkPasswordHash, hashedPassword } from "../auth.js";
import { NewUser, UserResponse } from "src/lib/db/schema.js";
import { respondWithJson, respondWithJsonError } from "../json-response.js";

export type UserParameter = {
  email: string;
  password: string;
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
      return
    }
    const isValidPassword = await checkPasswordHash(
      params.password,
      result.hashedPassword
    );
    if (!isValidPassword) {
      respondWithJsonError(res, 401, "Unauthorized");
      return;
    }
    const payload: UserResponse = {
      id: result.id,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      email: result.email,
    };
    respondWithJson(res, 200, payload);
  } catch (error) {
    next(error);
  }
};
