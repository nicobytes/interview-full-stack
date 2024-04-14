import { createFactory } from 'hono/factory';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@src/db/schema';
import { App } from '@src/types';

const factory = createFactory<App>();

export const dbMiddleware = factory.createMiddleware(async (c, next) => {
  const db = drizzle(c.env.DB, { schema });
  c.set('db', db);
  await next();
});
