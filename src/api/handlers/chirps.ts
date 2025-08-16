import {
  application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  ForbiddenError,
  NotFoundError,
  PermissionError,
  ValidationError,
} from "../custom-errors.js";
import {
  addChirpByUserID,
  deleteChirpById,
  getChirpById,
  getChirpByUserId,
  getChirps,
} from "../../lib/db/queries/chirps.js";
import { respondWithJson, respondWithJsonError } from "../json-response.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../../config.js";

export const handleAddChirp = async (req: Request, res: Response) => {
  type parameters = {
    body: string;
    // userId: string;
  };
  type ResponseBody = {
    cleanedBody: string;
  };
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwtSecret);
  if (!userId) {
    throw new Error("User id invalid or not found");
  }
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
    userId,
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

export async function handleDeleteChirpById(req: Request, res: Response) {
  const accessToken = getBearerToken(req);
  if (!accessToken) {
    throw new PermissionError("Invalid access token");
  }

  const userID = validateJWT(accessToken, config.jwtSecret);
  if (!userID) {
    throw new ForbiddenError("User not found");
  }
  const { chirpID } = req.params;
  const chirp = await getChirpById(chirpID);
  if(!chirp){
    throw new NotFoundError("Chirp not found");
  }
  if(chirp.userId !== userID){
    throw new ForbiddenError("Chirp not found");
  }
  const result = await deleteChirpById(chirpID);
  if (!result?.deletedId) {
    throw new Error("Could not delete the chirp")
  }
  res.status(204).end();
}
