import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import {
  errorHandler,
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middleware.js";
import { handleHitCount, handlerReadiness } from "./api/handlers/handlers.js";
import { handlerCreateUser } from "./api/handlers/users.js";
import { handleReset } from "./api/handlers/reset.js";
import { handleAddChirp, handleGetChirps } from "./api/handlers/chirps.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handleHitCount);
app.post("/admin/reset", handleReset);
app.post("/api/users", handlerCreateUser);

app.post("/api/chirps", async (req, res, next) => {
  try {
    await handleAddChirp(req, res);
  } catch (err) {
    next(err);
  }
});
app.get("/api/chirps", async (req, res, next) => {
  try {
    await handleGetChirps(req, res);
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);
app.listen(PORT);
