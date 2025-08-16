import type { MigrationConfig } from "drizzle-orm/migrator";
import { loadEnvFile } from "node:process";
loadEnvFile();

export function envOrThrow(key: string) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`There is no value for ${key} in environment variables`);
  }
  return value;
}

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "src/lib/db/migrations",
};

const db: DBConfig = {
  url: envOrThrow("DB_URL"),
  migrationConfig,
};


type APIConfig = {
  api: {
    fileServerHits: number;
    platform: string;
  };
  db: DBConfig;
  jwtSecret: string;
};

const config: APIConfig = {
  api: {
    fileServerHits: 0,
    platform: envOrThrow("PLATFORM"),
  },
  db,
  jwtSecret: envOrThrow("JWT_SECRET")
};

export { config };
