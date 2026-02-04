import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bizmentor';

let db: any;
let client: any;

try {
  client = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  db = drizzle(client, { schema });
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('⚠️ Database connection failed:', error);
  // Create a mock db object that won't crash the server
  db = null;
}

export { db };
export * from './schema';
