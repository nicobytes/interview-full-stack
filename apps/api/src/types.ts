import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from '@src/db/schema';
import { Bindings } from '@src/bindings';

export type DB = DrizzleD1Database<typeof schema>;

export type App = {
  Bindings: Bindings,
  Variables: { db: DB }
}
