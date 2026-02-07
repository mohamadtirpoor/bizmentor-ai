import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:jpMjfUFd8b2DlnaMkcSX6ctd@businessmeter:5432/postgres';

async function initDatabase() {
  console.log('🔌 Connecting to database...');
  
  const sql = postgres(connectionString);

  try {
    console.log('🗑️  Dropping existing tables...');
    await sql`DROP TABLE IF EXISTS messages CASCADE`;
    await sql`DROP TABLE IF EXISTS chats CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    console.log('📦 Creating users table...');
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        password TEXT DEFAULT '',
        has_premium BOOLEAN DEFAULT true,
        free_messages_used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('📦 Creating chats table...');
    await sql`
      CREATE TABLE chats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        mode TEXT DEFAULT 'consultant',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('📦 Creating messages table...');
    await sql`
      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id),
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('✅ Database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
