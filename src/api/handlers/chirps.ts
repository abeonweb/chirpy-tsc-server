import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../custom-errors.js";
import { addChirpByUserID, getChirps } from "../../lib/db/queries/chirps.js";

export const handleAddChirp = async (req: Request, res: Response) => {
  type parameters = {
    body: string;
    userId: string;
  };
  type ResponseBody = {
    cleanedBody: string;
  };

  let data: parameters = req?.body;
  if (data?.body.length > 140) {
      throw new ValidationError("Chirp is too long. Max length is 140");
    }
    const bad_words = ["kerfuffle", "sharbert", "fornax"];
    const body_split: string[] = data.body.split(" ");
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
    const result = await addChirpByUserID({
        body: responseBody.cleanedBody,
        userId: data.userId,
    });
    res.header("Content-Type", "application/json");
    res.status(201).send(JSON.stringify(result)).end();
};

export async function handleGetChirps(req: Request, res: Response) {
  const result = await getChirps();
  res.header("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(result))
  res.end();
}

