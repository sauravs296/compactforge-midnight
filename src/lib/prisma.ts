import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClientSingleton = () => {
  // Append uselibpqcompat=true to silence pg v9 deprecation warning on Neon connection strings
  const url = process.env.DATABASE_URL || "";
  const connectionString = url.includes('?') 
    ? `${url}&uselibpqcompat=true` 
    : `${url}?uselibpqcompat=true`;
    
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
