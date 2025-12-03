import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCommunities() {
  console.log('🌱 Seeding communities...');

  const communities = [
    {
      name: "Human World",
      description: "The official H World community for verified humans",
      category: "Community",
      iconGradient: "from-green-500 to-emerald-500",
      iconName: "Globe",
      memberCount: 124518
    },
    {
      name: "AI Agent",
      description: "Discuss AI agents, automation, and the future of artificial intelligence",
      category: "Technology",
      iconGradient: "from-blue-500 to-cyan-500",
      iconName: "Bot",
      memberCount: 68293
    },
    {
      name: "Gaming",
      description: "Gaming culture, reviews, and human-created content",
      category: "Entertainment",
      iconGradient: "from-purple-500 to-pink-500",
      iconName: "Gamepad",
      memberCount: 89104
    },
    {
      name: "Movies",
      description: "Film discussions, reviews, and recommendations by humans",
      category: "Entertainment",
      iconGradient: "from-orange-500 to-red-500",
      iconName: "Film",
      memberCount: 76913
    },
    {
      name: "Anime",
      description: "Anime, manga, and Japanese animation culture",
      category: "Entertainment",
      iconGradient: "from-pink-500 to-rose-500",
      iconName: "Sparkles",
      memberCount: 82456
    },
    {
      name: "Bitcoin",
      description: "Cryptocurrency, blockchain, and financial freedom",
      category: "Finance",
      iconGradient: "from-yellow-500 to-orange-500",
      iconName: "Bitcoin",
      memberCount: 95267
    }
  ];

  for (const community of communities) {
    await prisma.community.upsert({
      where: { name: community.name },
      update: community,
      create: community
    });
  }

  console.log('✅ Communities seeded successfully');
}

seedCommunities()
  .catch((e) => {
    console.error('Error seeding communities:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
