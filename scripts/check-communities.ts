import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCommunities() {
  console.log('📋 Checking communities in database...\n');

  const communities = await prisma.community.findMany({
    orderBy: { name: 'asc' },
  });

  if (communities.length === 0) {
    console.log('❌ No communities found in database');
    return;
  }

  console.log(`✅ Found ${communities.length} communities:\n`);
  communities.forEach((c, index) => {
    console.log(`${index + 1}. ${c.name}`);
    console.log(`   ID: ${c.id}`);
    console.log(`   Category: ${c.category}`);
    console.log(`   Members: ${c.memberCount}`);
    console.log(`   Gradient: ${c.iconGradient}`);
    console.log(`   Icon: ${c.iconName}`);
    console.log('');
  });
}

checkCommunities()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
