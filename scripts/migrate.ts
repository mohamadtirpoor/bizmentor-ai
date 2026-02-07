import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:jpMjfUFd8b2DlnaMkcSX6ctd@businessmeter:5432/postgres';

async function main() {
  console.log('🔌 Connecting to database...');
  
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log('🚀 Running migrations...');
  
  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('✅ Migrations completed!');
  
  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
