import { defineConfig } from "drizzle-kit";

// Next.js reads .env.local on its own; drizzle-kit does not. Without this the
// db:* scripts see no DATABASE_URL. Deployed environments inject it directly,
// so a missing file is not an error.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local — fall through to the real environment.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema",
  out: "./lib/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
