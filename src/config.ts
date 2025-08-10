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

type APIConfig = {
  api: {
    fileServerHits: number;
    platform: string;
  };
  db: DBConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "src/lib/db/migrations",
};

const db: DBConfig = {
  url: envOrThrow("DB_URL"),
  migrationConfig,
};

const config: APIConfig = {
  api: {
    fileServerHits: 0,
    platform: envOrThrow("PLATFORM"),
  },
  db,
};

export { config };
