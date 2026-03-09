const { Client } = require('pg');
require('dotenv').config();

async function createTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Veritabanina baglaniyor...");
    await client.connect();
    console.log("Baglanti basarili! Tablolar olusturuluyor...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Team" (
        "id" TEXT PRIMARY KEY,
        "week" INTEGER NOT NULL,
        "name" TEXT NOT NULL,
        "captain" TEXT NOT NULL,
        "members" JSONB NOT NULL,
        "tournamentCategory" TEXT NOT NULL,
        "tournamentTier" TEXT NOT NULL,
        "projectTitle" TEXT NOT NULL,
        "createdAtISO" TEXT NOT NULL,
        "badges" JSONB NOT NULL,
        "scores" JSONB NOT NULL,
        "judgeNote" TEXT NOT NULL,
        "tournament" TEXT NOT NULL,
        "school" TEXT NOT NULL,
        "projectMainCategory" TEXT,
        "projectSubCategory" TEXT,
        "assignedJudgeId" TEXT,
        "scoresEnteredByJudgeId" TEXT
      );
    `);
    console.log("Team tablosu olusturuldu.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Session" (
        "token" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Session tablosu olusturuldu.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Judge" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "createdAtISO" TEXT
      );
    `);
    console.log("Judge tablosu olusturuldu.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "teamId" TEXT NOT NULL,
        "judgeId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "oldScores" JSONB,
        "newScores" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("AuditLog tablosu olusturuldu.");

    console.log("\\nTum tablolar basariyla olusturuldu!");
  } catch (err) {
    console.error("HATA:", err.message);
  } finally {
    await client.end();
  }
}

createTables();
