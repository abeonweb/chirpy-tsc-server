import type { NextFunction, Request, Response } from "express";
import { CreateUserError } from "../custom-errors.js";
import { createUser, deleteUsers } from "../../lib/db/queries/users.js";
import { config } from "../../config.js";

export const handlerCreateUser = async (req: Request, res: Response) => {
  type parameter = {
    email: string;
  };
  const data: parameter = req?.body;

  if (!data?.email) {
    throw new CreateUserError("Incorrect email entered");
  }
  const result = await createUser({ email: data.email });
  res.header("Content-Type", "application/json");
  res.status(201).send(JSON.stringify(result));
  res.end();
};
