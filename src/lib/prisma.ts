import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

const createPrismaClient = () => {
  console.log('🔧 [PRISMA] Creating new Prisma client...');
  console.log('🔧 [PRISMA] DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('🔧 [PRISMA] DATABASE_URL value:', process.env.DATABASE_URL ? 'Set (masked)' : 'NOT SET');
  
  try {
    const client = new PrismaClient({
      log: ['error', 'warn'],
    }).$extends(withAccelerate());
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
