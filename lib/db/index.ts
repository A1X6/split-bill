import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Database = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string to .env.local, then run `npm run db:migrate`. See the README."
    );
  }
  return drizzle({ client: neon(url), schema });
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
