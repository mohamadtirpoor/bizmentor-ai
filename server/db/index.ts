import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:jpMjfUFd8b2DlnaMkcSX6ctd@businessmeter:5432/postgres';

console.log('🔌 Connecting to database...');

let db: any = null;

try {
  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  
  db = drizzle(client, { schema });
  console.log('✅ Database connected successfully');
} catch (error) {
  console.log('⚠️ Database connection failed (running without database)');
  db = null;
}

export { db };
export * from './schema';

