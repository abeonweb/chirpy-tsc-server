import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../custom-errors.js";
import { config } from "../../config.js";

export const handleHitCount = (req: Request, res: Response) => {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
  </body>
</html>`);
};

export const handlerReadiness = (req: Request, res: Response) => {
  res.set("Content-Type", "text/plain; charset=utf-8").send("OK");
};

export const handleChirpValidation = async (req: Request, res: Response) => {
  // type RequestBody = {
  //   body: string;
  // };
  type ResponseBody = {
    cleanedBody: string;
  };
  type ErrorBody = {
    error: string;
  };

  // try {
  let reqBody = req?.body;
  // req.on("data", (chunk)=>{
  //   body += chunk
  // })
  // req.on("end", ()=>{
  res.set("Content-Type", "application/json");
  // const parsedBody: RequestBody = JSON.parse(body);
  if (reqBody?.body.length > 140) {
    throw new ValidationError("Chirp is too long. Max length is 140");
  }
  const bad_words = ["kerfuffle", "sharbert", "fornax"];
  const body_split: string[] = reqBody.body.split(" ");
  const cleanedBody = body_split
    .map((word) => {
      if (bad_words.includes(word.toLowerCase())) {
        return "****";
      }
      return word;
    })
    .join(" ");
  const responseBody: ResponseBody = {
    cleanedBody,
  };
  res.send(JSON.stringify(responseBody));
  // } catch (error) {
  //   let msg = "Something went wrong";
  //   if (error instanceof Error) msg = error.message;
  //   const errorBody: ErrorBody = { error: msg };
  //   res.status(400).send(JSON.stringify(errorBody));
  // }
  // })
};
