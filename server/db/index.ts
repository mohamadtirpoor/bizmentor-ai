import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:jpMjfUFd8b2DlnaMkcSX6ctd@businessmeter:5432/postgres';

console.log('🔌 Connecting to database...');

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

console.log('✅ Database connected successfully');

export * from './schema';

