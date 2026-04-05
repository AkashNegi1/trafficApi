import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL not set in environment");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

prisma.$connect()
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ Database connection failed:", err));

export { prisma };