const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await c.connect();
  await c.query('ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "rawScores" JSONB;');
  console.log('Added rawScores to DB');
  await c.end();
}
run().catch(console.error);
