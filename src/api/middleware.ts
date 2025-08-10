import { Request, Response, NextFunction } from "express";
import {
  ForbiddenError,
  NotFoundError,
  PermissionError,
  ValidationError,
} from "./custom-errors.js";
import { config } from "../config.js";

export const middlewareLogResponses = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.on("finish", () => {
    if (res.statusCode != 200) {
      console.log(
        `[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`
      );
    }
  });
  next();
};

export const middlewareMetricsInc = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  config.api.fileServerHits = config.api.fileServerHits + 1;
  next();
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
  } else if (err instanceof PermissionError) {
    res.status(401).json({ error: err.message });
  } else if (err instanceof ForbiddenError) {
    res.status(403).json({ error: err.message });
  } else if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
  } else {
    console.log("500 Internal Server Error");
  }
};
