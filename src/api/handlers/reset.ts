import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, ValidationError } from "../custom-errors.js";
import { config } from "../../config.js";
import { deleteUsers } from "../../lib/db/queries/users.js";

export const handleReset = async (req: Request, res: Response) => {
  if (config.api.platform !== "dev") {
    throw new ForbiddenError("Reset is not possible");
  }
  try {
    await deleteUsers();
    config.api.fileServerHits = 0;
    res.write("Hit reset");
    res.end();
  } catch (error) {
    throw error;
  }
};
