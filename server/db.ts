import * as dotenv from "dotenv";
import { drizzle } from 'drizzle-orm/node-postgres';
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}


export const db = drizzle(process.env.DATABASE_URL);
