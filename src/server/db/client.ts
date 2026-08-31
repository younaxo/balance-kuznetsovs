import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@/lib/env.server";
import * as schema from "./schema";

/**
 * Единственный экземпляр пула подключений к PostgreSQL на процесс.
 * В dev-режиме Next.js модуль может быть переисполнен при hot reload —
 * кладём клиент в globalThis, чтобы не плодить подключения.
 */
declare global {
  var __pgClient: postgres.Sql | undefined;
}

const client =
  globalThis.__pgClient ??
  postgres(serverEnv.DATABASE_URL, {
    max: 10,
    onnotice: () => {}, // не шумим NOTICE-логами Postgres в консоль
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgClient = client;
}

export const db = drizzle(client, { schema });
export type Database = typeof db;
