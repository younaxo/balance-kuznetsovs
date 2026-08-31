import { defineConfig } from "drizzle-kit";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL не задан. Скопируйте .env.example в .env и заполните строку подключения.",
  );
}

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
