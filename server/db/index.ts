import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Temporarily disable database
console.log('⚠️ Database is temporarily disabled');
export const db: any = null;

export * from './schema';

