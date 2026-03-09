import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    console.log("Bağlanıyor...");
    await prisma.$connect();
    console.log("Başarılı!");
  } catch(e) {
    console.error("Hاتا:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
