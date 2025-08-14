import {
  application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ValidationError } from "../custom-errors.js";
import {
  addChirpByUserID,
  getChirpById,
  getChirps,
} from "../../lib/db/queries/chirps.js";
import { respondWithJson, respondWithJsonError } from "../json-response.js";

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
  respondWithJson(res, 201, result);
};

export async function handleGetChirps(req: Request, res: Response) {
  const result = await getChirps();
  respondWithJson(res, 200, result);
}

export async function handleGetChirpById(req: Request, res: Response) {
  const { chirpID } = req.params;
  const result = await getChirpById(chirpID);
  res.header("Content-Type", "application/json");
  if (result) {
    respondWithJson(res, 200, result);
  } else {
    respondWithJsonError(res, 404, "Chirp not found");
  }
}


