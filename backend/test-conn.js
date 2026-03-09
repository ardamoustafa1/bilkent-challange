import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Bağlanıyor: " + process.env.DATABASE_URL);
    await client.connect();
    console.log("Bağlantı başarılı!");
    await client.end();
  } catch (err) {
    console.error("HATA:", err.message);
  }
}

testConnection();
