// Test script to verify Prisma PaymentIntent model exists
const { PrismaClient } = require('@prisma/client')

async function testPrisma() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing Prisma Client...')
    console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')))
    
    // Test PaymentIntent model
    const count = await prisma.paymentIntent.count()
    console.log('✅ PaymentIntent model works! Count:', count)
    
    // Test User model with isPro field
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        isPro: true,
        worldId: true,
      }
    })
    console.log('✅ User model with isPro and worldId works!', user)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPrisma()
