import { Response } from "express";

export function respondWithJson(res: Response, code: number, payload: any) {
  res.header("Content-Type", "application/json");
  const json = JSON.stringify(payload);
  res.status(code).send(json).end();
}

export function respondWithJsonError(
  res: Response,
  code: number,
  message: string
) {
  const payload = { error: message };
  respondWithJson(res, code, payload);
}
