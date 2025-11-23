import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
  {
    id: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    username: 'crypto_sage',
    displayName: 'Crypto Sage',
    bio: 'Bitcoin maximalist since 2013. Building the future of finance.',
    isVerified: true,
    verificationLevel: 'orb',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=crypto_sage',
  },
  {
    id: '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u',
    username: 'ai_researcher',
    displayName: 'Dr. Sarah Chen',
    bio: 'AI Researcher @ Stanford. Exploring AGI safety and alignment.',
    isVerified: true,
    verificationLevel: 'orb',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=ai_researcher',
  },
  {
    id: '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v',
    username: 'defi_degen',
    displayName: 'DeFi Degen',
    bio: 'Yield farming enthusiast. Not financial advice.',
    isVerified: true,
    verificationLevel: 'device',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=defi_degen',
  },
  {
    id: '0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w',
    username: 'tech_optimist',
    displayName: 'Alex Rivera',
    bio: 'Software engineer building the decentralized web.',
    isVerified: true,
    verificationLevel: 'device',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=tech_optimist',
  },
  {
    id: '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x',
    username: 'nft_collector',
    displayName: 'NFT Collector',
    bio: 'Digital art enthusiast. Collecting memories on-chain.',
    isVerified: false,
    verificationLevel: null,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=nft_collector',
  },
  {
    id: '0x6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y',
    username: 'blockchain_dev',
    displayName: 'Emily Zhang',
    bio: 'Smart contract developer. Solidity & Rust.',
    isVerified: true,
    verificationLevel: 'orb',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=blockchain_dev',
  },
  {
    id: '0x7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
    username: 'web3_builder',
    displayName: 'Marcus Johnson',
    bio: 'Building the next generation of social apps.',
    isVerified: false,
    verificationLevel: null,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=web3_builder',
  },
  {
    id: '0x8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a',
    username: 'metaverse_explorer',
    displayName: 'Luna Martinez',
    bio: 'Exploring virtual worlds and digital experiences.',
    isVerified: true,
    verificationLevel: 'device',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=metaverse_explorer',
  },
  {
    id: '0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b',
    username: 'dao_governance',
    displayName: 'DAO Advocate',
    bio: 'Decentralized governance maximalist. Power to the people.',
    isVerified: false,
    verificationLevel: null,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=dao_governance',
  },
  {
    id: '0xa0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c',
    username: 'tokenomics_expert',
    displayName: 'Professor Token',
    bio: 'Teaching tokenomics and crypto economics.',
    isVerified: true,
    verificationLevel: 'orb',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=tokenomics_expert',
  },
];

const tweets = [
  // Crypto Bull Run tweets
  {
    userId: 'crypto_sage',
    content: 'Bitcoin breaking $100K is just the beginning. The real bull run starts when institutional adoption becomes mainstream. We\'re still early. 🚀',
    likes: 234,
    retweets: 89,
  },
  {
    userId: 'defi_degen',
    content: 'ETH staking yields looking juicy right now. Layer 2s are solving the gas fee problem. DeFi summer 2.0 incoming? 💎🙌',
    likes: 156,
    retweets: 45,
  },
  {
    userId: 'tokenomics_expert',
    content: 'Analyzing the tokenomics of recent launches. Most projects still don\'t understand supply-demand dynamics. Thread 🧵',
    likes: 312,
    retweets: 127,
  },
  
  // AI News tweets
  {
    userId: 'ai_researcher',
    content: 'OpenAI\'s latest GPT update is mind-blowing. The improvements in reasoning and code generation are a huge leap forward. AGI timeline accelerating? 🤖',
    likes: 445,
    retweets: 203,
  },
  {
    userId: 'ai_researcher',
    content: 'Just published our paper on AI alignment. The key insight: we need human-in-the-loop verification at scale. Excited to share the results! 📊',
    likes: 287,
    retweets: 98,
  },
  {
    userId: 'tech_optimist',
    content: 'Google\'s Gemini 2.0 vs GPT-4.5 comparison is fascinating. Different approaches to multimodal AI. Competition drives innovation! 🔥',
    likes: 198,
    retweets: 67,
  },
  
  // Web3 Development
  {
    userId: 'blockchain_dev',
    content: 'Deployed my first zkSNARK circuit on mainnet today. Zero-knowledge proofs are the future of privacy. The math is beautiful. 🔐',
    likes: 167,
    retweets: 52,
  },
  {
    userId: 'blockchain_dev',
    content: 'Hot take: Solidity is becoming the JavaScript of blockchain. Love it or hate it, it\'s here to stay. Time to embrace the ecosystem.',
    likes: 223,
    retweets: 78,
  },
  {
    userId: 'web3_builder',
    content: 'Building a decentralized social platform is harder than expected. But the vision of censorship-resistant communication is worth it. 💪',
    likes: 134,
    retweets: 41,
  },
  {
    userId: 'tech_optimist',
    content: 'The intersection of AI and blockchain is where magic happens. Verifiable computation + autonomous agents = new paradigm. 🌟',
    likes: 289,
    retweets: 112,
  },
  
  // NFTs and Digital Art
  {
    userId: 'nft_collector',
    content: 'Just minted an incredible piece from an emerging artist. NFTs aren\'t dead - they\'re evolving. The art is what matters. 🎨',
    likes: 89,
    retweets: 23,
  },
  {
    userId: 'metaverse_explorer',
    content: 'Spent 3 hours exploring a new metaverse world. The level of detail is insane. This is the future of social interaction. 🌐',
    likes: 145,
    retweets: 38,
  },
  {
    userId: 'nft_collector',
    content: 'Unpopular opinion: Most NFT projects failed because they focused on speculation rather than utility. Art + community = sustainable value.',
    likes: 267,
    retweets: 94,
  },
  
  // DAO and Governance
  {
    userId: 'dao_governance',
    content: 'DAOs are finally maturing. Seeing real governance innovation with quadratic voting and conviction voting. Democracy 2.0 is here! 🗳️',
    likes: 178,
    retweets: 56,
  },
  {
    userId: 'dao_governance',
    content: 'Why do most DAOs fail? Poor token distribution and whale dominance. We need better mechanisms for equal representation.',
    likes: 201,
    retweets: 73,
  },
  {
    userId: 'tokenomics_expert',
    content: 'Token distribution models comparison: Fair launch vs VC-backed vs Airdrop. Each has tradeoffs. Thread analyzing 50+ projects 🧵',
    likes: 356,
    retweets: 145,
  },
  
  // General Tech and Innovation
  {
    userId: 'tech_optimist',
    content: 'The rate of technological progress is exponential. AI, blockchain, biotech - all converging. We\'re living in the most exciting time in history! 🚀',
    likes: 423,
    retweets: 167,
  },
  {
    userId: 'blockchain_dev',
    content: 'Code review tip: Security > Optimization > Readability. But all three matter. Writing secure smart contracts is an art form. 🛡️',
    likes: 189,
    retweets: 61,
  },
  {
    userId: 'web3_builder',
    content: 'Just launched our beta! Decentralized identity + verifiable credentials. Users own their data. This is what Web3 is about. 🔑',
    likes: 312,
    retweets: 98,
  },
  {
    userId: 'metaverse_explorer',
    content: 'VR headset sales are up 300% this year. The metaverse isn\'t hype - it\'s happening. Get ready for the paradigm shift. 🥽',
    likes: 234,
    retweets: 87,
  },
  
  // Market Commentary
  {
    userId: 'crypto_sage',
    content: 'Market cycles are psychological more than technical. Fear and greed drive everything. Master your emotions = master the market. 📈',
    likes: 278,
    retweets: 103,
  },
  {
    userId: 'defi_degen',
    content: 'PSA: Always DYOR. Just because an influencer shills a project doesn\'t make it good. Do the math, read the code, verify everything. 🔍',
    likes: 167,
    retweets: 54,
  },
  {
    userId: 'tokenomics_expert',
    content: 'Inflation vs deflation in crypto: Both can work if designed correctly. Bitcoin\'s halving is genius but not the only model. 💡',
    likes: 298,
    retweets: 115,
  },
  
  // AI Ethics and Safety
  {
    userId: 'ai_researcher',
    content: 'AI safety isn\'t just about preventing Terminator scenarios. It\'s about bias, fairness, and ensuring AI benefits humanity. Critical work. ⚖️',
    likes: 389,
    retweets: 156,
  },
  {
    userId: 'tech_optimist',
    content: 'Open source AI models are democratizing access to intelligence. This is bigger than any single company. The future is collaborative. 🤝',
    likes: 267,
    retweets: 91,
  },
  
  // Community and Culture
  {
    userId: 'metaverse_explorer',
    content: 'Met amazing people from 12 different countries in VR today. Digital communities transcend physical boundaries. This is powerful. 🌍',
    likes: 198,
    retweets: 67,
  },
  {
    userId: 'dao_governance',
    content: 'Community is everything. Technology is just a tool. The real innovation is how we coordinate and collaborate at scale. 🤝',
    likes: 234,
    retweets: 82,
  },
  {
    userId: 'nft_collector',
    content: 'Collected my 100th NFT today! Each one tells a story. Digital art is real art. Thanks to all the incredible creators out there. 🙏',
    likes: 145,
    retweets: 43,
  },
  
  // Technical Insights
  {
    userId: 'blockchain_dev',
    content: 'Rust is eating the blockchain world. Solana, Polkadot, NEAR - all Rust-based. Memory safety + performance = perfect for blockchain. 🦀',
    likes: 312,
    retweets: 124,
  },
  {
    userId: 'web3_builder',
    content: 'Frontend devs: Learn Web3. The demand is insane and only growing. React + ethers.js + IPFS = your ticket to the future. 💻',
    likes: 256,
    retweets: 89,
  },
  {
    userId: 'crypto_sage',
    content: 'Final thought: The best time to buy was 10 years ago. The second best time is now. But only invest what you can afford to lose. NFA. 💰',
    likes: 445,
    retweets: 178,
  },
];

const comments = [
  // Comments on crypto tweets
  { tweetIndex: 0, userId: 'defi_degen', content: 'Absolutely agree! The ETF approvals changed everything. Institutions are coming.' },
  { tweetIndex: 0, userId: 'nft_collector', content: 'But what about the environmental concerns? ESG narrative still matters.' },
  { tweetIndex: 0, userId: 'tokenomics_expert', content: 'Supply shock is real. Hodlers aren\'t selling. This cycle is different.' },
  
  { tweetIndex: 1, userId: 'blockchain_dev', content: 'Base and Arbitrum are game changers. Sub-cent transactions finally possible.' },
  { tweetIndex: 1, userId: 'crypto_sage', content: 'Still prefer mainnet for large amounts. L2s are great for small txs though.' },
  
  { tweetIndex: 2, userId: 'dao_governance', content: 'Would love to see your analysis on governance tokens. Most are broken.' },
  { tweetIndex: 2, userId: 'defi_degen', content: 'Ponzinomics are still rampant. Good thread needed!' },
  
  // Comments on AI tweets
  { tweetIndex: 3, userId: 'tech_optimist', content: 'The coding abilities are scary good. Junior devs should be worried.' },
  { tweetIndex: 3, userId: 'blockchain_dev', content: 'Used it to audit my smart contracts. Found 3 vulnerabilities I missed!' },
  { tweetIndex: 3, userId: 'web3_builder', content: 'AI + blockchain = unstoppable combo. Building tools at the intersection.' },
  
  { tweetIndex: 4, userId: 'tech_optimist', content: 'Congrats on the publication! Will read it tonight.' },
  { tweetIndex: 4, userId: 'dao_governance', content: 'Human oversight is crucial. Decentralized AI alignment sounds interesting!' },
  
  { tweetIndex: 5, userId: 'ai_researcher', content: 'Both are impressive. Competition is healthy for the ecosystem.' },
  { tweetIndex: 5, userId: 'metaverse_explorer', content: 'Multimodal AI will change how we interact with virtual worlds.' },
  
  // Comments on Web3 development
  { tweetIndex: 6, userId: 'crypto_sage', content: 'zkSNARKs are the future. Privacy + verification = perfect combo.' },
  { tweetIndex: 6, userId: 'tech_optimist', content: 'The math is indeed beautiful. Wrote a tutorial on this recently.' },
  
  { tweetIndex: 7, userId: 'web3_builder', content: 'Solidity has its flaws but the tooling is mature. Hard to beat.' },
  { tweetIndex: 7, userId: 'tokenomics_expert', content: 'Security audits are critical though. Too many exploits still happening.' },
  
  { tweetIndex: 8, userId: 'dao_governance', content: 'Keep building! Censorship resistance is worth fighting for.' },
  { tweetIndex: 8, userId: 'tech_optimist', content: 'What tech stack are you using? Always curious about new approaches.' },
  
  // Comments on NFT tweets
  { tweetIndex: 10, userId: 'metaverse_explorer', content: 'Who\'s the artist? Always looking for new talent to support.' },
  { tweetIndex: 10, userId: 'crypto_sage', content: 'Art + scarcity + ownership = value. Simple equation.' },
  
  { tweetIndex: 11, userId: 'nft_collector', content: 'Which platform? Been exploring different metaverse worlds.' },
  { tweetIndex: 11, userId: 'web3_builder', content: 'Social VR is the killer app. Just needs better UX.' },
  
  { tweetIndex: 12, userId: 'dao_governance', content: '100% this. Utility > speculation. Community is everything.' },
  { tweetIndex: 12, userId: 'tokenomics_expert', content: 'Most projects had no business model. Art + community = sustainable.' },
  
  // Comments on DAO tweets
  { tweetIndex: 13, userId: 'tokenomics_expert', content: 'Quadratic voting is fascinating. Prevents whale dominance.' },
  { tweetIndex: 13, userId: 'blockchain_dev', content: 'Implementing this in our next DAO launch. Excited to experiment!' },
  
  { tweetIndex: 14, userId: 'crypto_sage', content: 'Fair launch > VC dump. Let the market decide value.' },
  { tweetIndex: 14, userId: 'web3_builder', content: 'Whale problems plague every DAO. Need better distribution mechanisms.' },
  
  // Comments on market analysis
  { tweetIndex: 20, userId: 'defi_degen', content: 'Psychology is 90% of trading. Technical analysis is just confirmation bias.' },
  { tweetIndex: 20, userId: 'nft_collector', content: 'Learned this the hard way in 2022. Emotions killed my portfolio.' },
  
  { tweetIndex: 21, userId: 'crypto_sage', content: 'Trust but verify. Always read the contract code yourself.' },
  { tweetIndex: 21, userId: 'blockchain_dev', content: 'So many scams could be avoided with basic due diligence.' },
  
  // Comments on AI ethics
  { tweetIndex: 23, userId: 'tech_optimist', content: 'Bias in training data is a huge issue. Need diverse datasets.' },
  { tweetIndex: 23, userId: 'dao_governance', content: 'Decentralized AI governance could help solve this. Community oversight.' },
  
  { tweetIndex: 24, userId: 'ai_researcher', content: 'Open source is crucial for transparency and trust in AI systems.' },
  { tweetIndex: 24, userId: 'blockchain_dev', content: 'Verifiable AI on blockchain = trustless intelligence. Working on this!' },
  
  // Comments on community
  { tweetIndex: 25, userId: 'nft_collector', content: 'Virtual communities are more real than most IRL interactions now.' },
  { tweetIndex: 25, userId: 'dao_governance', content: 'Geography is becoming irrelevant. Global collaboration is the future.' },
  
  { tweetIndex: 26, userId: 'metaverse_explorer', content: 'Technology enables, community sustains. Both are necessary.' },
  { tweetIndex: 26, userId: 'tech_optimist', content: 'Coordination at scale is the hard problem. We\'re making progress!' },
  
  // Comments on technical insights
  { tweetIndex: 28, userId: 'blockchain_dev', content: 'Rust\'s ownership model maps perfectly to blockchain concepts.' },
  { tweetIndex: 28, userId: 'crypto_sage', content: 'Security without sacrificing performance. That\'s the dream.' },
  
  { tweetIndex: 29, userId: 'metaverse_explorer', content: 'Learning Web3 now. React + Web3.js tutorials are gold.' },
  { tweetIndex: 29, userId: 'ai_researcher', content: 'The intersection of AI and Web3 is where I see the most opportunity.' },
];

async function main() {
  console.log('🌱 Starting seed process...\n');

  // Create users
  console.log('👥 Creating users...');
  for (const userData of users) {
    await prisma.user.upsert({
      where: { id: userData.id },
      update: userData,
      create: {
        ...userData,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
      },
    });
    console.log(`   ✓ Created user: ${userData.username}`);
  }

  // Create tweets
  console.log('\n📝 Creating tweets...');
  const createdTweets = [];
  for (let i = 0; i < tweets.length; i++) {
    const tweetData = tweets[i];
    const user = users.find(u => u.username === tweetData.userId);
    
    if (!user) {
      console.log(`   ⚠ User not found: ${tweetData.userId}`);
      continue;
    }

    const tweet = await prisma.tweet.create({
      data: {
        content: tweetData.content,
        authorId: user.id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      },
    });

    // Create fake likes and retweets
    const likeCount = tweetData.likes || Math.floor(Math.random() * 100);
    const retweetCount = tweetData.retweets || Math.floor(Math.random() * 50);

    // You would create actual like/retweet records here if your schema supports it
    
    createdTweets.push(tweet);
    console.log(`   ✓ Created tweet by @${user.username}: "${tweetData.content.substring(0, 50)}..."`);
  }

  // Create comments
  console.log('\n💬 Creating comments...');
  for (const commentData of comments) {
    const tweet = createdTweets[commentData.tweetIndex];
    const user = users.find(u => u.username === commentData.userId);
    
    if (!tweet || !user) {
      console.log(`   ⚠ Tweet or user not found for comment`);
      continue;
    }

    await prisma.comment.create({
      data: {
        content: commentData.content,
        authorId: user.id,
        tweetId: tweet.id,
        createdAt: new Date(tweet.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000), // Comment within 24h of tweet
      },
    });

    console.log(`   ✓ Created comment by @${user.username} on tweet ${commentData.tweetIndex + 1}`);
  }

  console.log('\n✅ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${users.length} users created`);
  console.log(`   - ${tweets.length} tweets created`);
  console.log(`   - ${comments.length} comments created`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
