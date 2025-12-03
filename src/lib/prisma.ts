import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  console.log('🔧 [PRISMA] Creating new Prisma client...');
  console.log('🔧 [PRISMA] DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('🔧 [PRISMA] DATABASE_URL type:', process.env.DATABASE_URL?.startsWith('prisma+') ? 'Accelerate' : 'Direct');
  
  try {
    // Use direct connection for more reliability
    // If you want to use Accelerate, ensure DATABASE_URL is correct in Vercel
    const client = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    console.log('✅ [PRISMA] Prisma client created successfully');
    return client;
  } catch (error: any) {
    console.error('❌ [PRISMA] Failed to create Prisma client:', error);
    console.error('❌ [PRISMA] Error message:', error?.message);
    throw error;
  }
}

console.log('🔧 [PRISMA] Initializing Prisma...');
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  console.log('🔧 [PRISMA] Prisma client stored in global (development mode)');
}
