import { neon } from "@neondatabase/serverless";
import {
  drizzle as drizzleNeon,
  type NeonHttpDatabase,
} from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Typed against the Neon HTTP driver, the narrower of the two: it has no
 * multi-statement transactions. Anything that compiles against this surface
 * also runs on node-postgres, so it's the safe one to expose.
 */
type Database = NeonHttpDatabase<typeof schema>;

/**
 * Neon's HTTP driver talks to Neon's own endpoint, not the Postgres wire
 * protocol — point it at a plain Postgres and every query fails with
 * "fetch failed".
 */
function isNeonUrl(url: string) {
  try {
    return new URL(url).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

function createDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string to .env.local, then run `npm run db:migrate`. See the README."
    );
  }

  if (isNeonUrl(url)) {
    return drizzleNeon({ client: neon(url), schema });
  }

  return drizzleNode({
    client: new Pool({ connectionString: url }),
    schema,
  }) as unknown as Database;
}

let instance: Database | undefined;

/**
 * Connect on first use, not on import. A missing DATABASE_URL should fail only
 * the routes that actually need the database — not every page that transitively
 * imports this module, marketing pages included.
 */
export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    instance ??= createDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
