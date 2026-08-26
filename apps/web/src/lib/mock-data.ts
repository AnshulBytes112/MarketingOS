// Mock data for AI Brand Growth Engine

export const brandDNA = {
  name: "NovaBrew Coffee",
  industry: "Food & Beverage",
  website: "novabrew.com",
  logo: "NB",
  founded: "2021",
  geography: "United States",
  priceSegment: "Premium",
  positioning: "Sustainable specialty coffee for the modern professional",
  usp: "Single-origin, ethically sourced beans with AI-powered roast profiles",
  personality: ["Authentic", "Innovative", "Sustainable", "Sophisticated", "Approachable"],
  tone: ["Warm", "Expert", "Conversational", "Inspiring"],
  avoid: ["Excessive emojis", "Aggressive sales language", "Unverified health claims", "Slang"],
  audience: {
    primary: "Urban professionals 25-40",
    secondary: "Coffee enthusiasts & sustainability advocates",
    psychographics: ["Health-conscious", "Experience-driven", "Eco-aware", "Tech-savvy"],
  },
  contentPillars: [
    { name: "Education", weight: 30, color: "#7C3AED" },
    { name: "Product", weight: 25, color: "#2563EB" },
    { name: "Sustainability", weight: 20, color: "#10B981" },
    { name: "Culture", weight: 15, color: "#F59E0B" },
    { name: "Community", weight: 10, color: "#EF4444" },
  ],
};

export const competitors = [
  {
    id: "1",
    name: "BluePeak Coffee",
    handle: "@bluepeakcoffee",
    platform: "Instagram",
    followers: 84200,
    growth: 3.2,
    avgEngagement: 4.1,
    postsPerWeek: 5,
    contentMix: { video: 40, image: 45, carousel: 15 },
    topTopics: ["Brewing Tips", "Origin Stories", "Lifestyle"],
    score: 72,
    color: "#3B82F6",
  },
  {
    id: "2",
    name: "GroundLevel Roasters",
    handle: "@groundlevel",
    platform: "Instagram",
    followers: 62400,
    growth: 1.8,
    avgEngagement: 5.7,
    postsPerWeek: 4,
    contentMix: { video: 30, image: 50, carousel: 20 },
    topTopics: ["Roasting Process", "Coffee Science", "Events"],
    score: 68,
    color: "#8B5CF6",
  },
  {
    id: "3",
    name: "The Daily Grind Co.",
    handle: "@dailygrindco",
    platform: "LinkedIn",
    followers: 31000,
    growth: 5.4,
    avgEngagement: 3.2,
    postsPerWeek: 3,
    contentMix: { video: 20, image: 60, carousel: 20 },
    topTopics: ["Industry News", "Sustainability", "Business"],
    score: 61,
    color: "#10B981",
  },
];

export const contentGaps = [
  { topic: "Cold Brew Science", competitorCoverage: 12, audienceInterest: 89, opportunity: "High" },
  { topic: "Sustainability Reports", competitorCoverage: 8, audienceInterest: 76, opportunity: "High" },
  { topic: "Barista Spotlights", competitorCoverage: 22, audienceInterest: 71, opportunity: "Medium" },
  { topic: "Coffee & Wellness", competitorCoverage: 15, audienceInterest: 85, opportunity: "High" },
  { topic: "Home Brewing Guides", competitorCoverage: 45, audienceInterest: 92, opportunity: "Medium" },
  { topic: "Farm-to-Cup Stories", competitorCoverage: 5, audienceInterest: 80, opportunity: "High" },
];

export const trendingTopics = [
  { topic: "Iced Latte Variations", platform: "Instagram", volume: 2400000, growth: 34, relevance: 92, type: "Content" },
  { topic: "#SustainableCoffee", platform: "X", volume: 180000, growth: 21, relevance: 88, type: "Hashtag" },
  { topic: "Coffee Ceremony Culture", platform: "TikTok", volume: 5600000, growth: 67, relevance: 74, type: "Trend" },
  { topic: "Biohacking Morning Routine", platform: "YouTube", volume: 890000, growth: 45, relevance: 71, type: "Content" },
  { topic: "AI & Coffee Roasting", platform: "LinkedIn", volume: 24000, growth: 89, relevance: 95, type: "Industry" },
  { topic: "Third Wave Coffee Origins", platform: "Instagram", volume: 1100000, growth: 18, relevance: 85, type: "Content" },
];

export const monthlyStrategy = {
  month: "August 2026",
  primaryGoal: "Brand Awareness & Audience Growth",
  targetSegment: "Urban Professionals 25-40",
  kpiTargets: [
    { metric: "Follower Growth", target: "+8%", current: "+3.2%" },
    { metric: "Avg Engagement Rate", target: "5.5%", current: "4.1%" },
    { metric: "Website Clicks", target: "2,400", current: "1,890" },
    { metric: "Content Pieces", target: 40, current: 28 },
  ],
  funnelMap: [
    { stage: "Awareness", percentage: 40, content: ["Reels", "Instagram Stories", "X Threads"] },
    { stage: "Engagement", percentage: 25, content: ["Carousels", "Polls", "Q&As"] },
    { stage: "Consideration", percentage: 20, content: ["Blog posts", "Email", "Testimonials"] },
    { stage: "Trust", percentage: 10, content: ["Case studies", "Behind-the-scenes"] },
    { stage: "Conversion", percentage: 5, content: ["Offers", "Product demos", "CTAs"] },
  ],
};

export const contentCalendar = [
  {
    id: "c1", date: "2026-08-08", platform: "Instagram", type: "Reel", pillar: "Education",
    title: "5 Signs You're Using Stale Coffee Beans", status: "approved", score: 91,
    thumbnail: "reel", funnelStage: "Awareness",
  },
  {
    id: "c2", date: "2026-08-08", platform: "LinkedIn", type: "Article", pillar: "Sustainability",
    title: "How NovaBrew Reduced Its Carbon Footprint by 40%", status: "review", score: 87,
    thumbnail: "article", funnelStage: "Trust",
  },
  {
    id: "c3", date: "2026-08-09", platform: "Instagram", type: "Carousel", pillar: "Product",
    title: "Meet Our New Ethiopian Yirgacheffe Single Origin", status: "draft", score: 83,
    thumbnail: "carousel", funnelStage: "Consideration",
  },
  {
    id: "c4", date: "2026-08-10", platform: "X", type: "Thread", pillar: "Education",
    title: "The Science Behind Why Your Coffee Tastes Bitter", status: "approved", score: 88,
    thumbnail: "thread", funnelStage: "Awareness",
  },
  {
    id: "c5", date: "2026-08-11", platform: "Instagram", type: "Story", pillar: "Culture",
    title: "Sunday Slow Pour: Behind the Bar", status: "generating", score: null,
    thumbnail: "story", funnelStage: "Engagement",
  },
  {
    id: "c6", date: "2026-08-12", platform: "LinkedIn", type: "Post", pillar: "Community",
    title: "Why We Partner With Women-Led Coffee Farms", status: "approved", score: 94,
    thumbnail: "post", funnelStage: "Trust",
  },
  {
    id: "c7", date: "2026-08-13", platform: "Instagram", type: "Reel", pillar: "Product",
    title: "Cold Brew in 5 Minutes: Our Secret Method", status: "draft", score: null,
    thumbnail: "reel", funnelStage: "Awareness",
  },
  {
    id: "c8", date: "2026-08-14", platform: "X", type: "Post", pillar: "Education",
    title: "Thread: The History of Ethiopian Coffee Ceremony", status: "review", score: 79,
    thumbnail: "thread", funnelStage: "Engagement",
  },
];

export const performanceData = {
  weekly: [
    { week: "Jul 7", impressions: 42000, reach: 31000, engagement: 1820, clicks: 890, saves: 340 },
    { week: "Jul 14", impressions: 38000, reach: 28000, engagement: 1640, clicks: 740, saves: 290 },
    { week: "Jul 21", impressions: 51000, reach: 39000, engagement: 2310, clicks: 1120, saves: 430 },
    { week: "Jul 28", impressions: 48000, reach: 36000, engagement: 2100, clicks: 980, saves: 390 },
    { week: "Aug 4", impressions: 58000, reach: 44000, engagement: 2650, clicks: 1340, saves: 510 },
    { week: "Aug 11", impressions: 63000, reach: 48000, engagement: 2900, clicks: 1560, saves: 580 },
  ],
  byPlatform: [
    { platform: "Instagram", posts: 22, avgEngagement: 5.2, reach: 28400, topFormat: "Reels" },
    { platform: "LinkedIn", posts: 12, avgEngagement: 3.8, reach: 11200, topFormat: "Articles" },
    { platform: "X", posts: 18, avgEngagement: 2.1, reach: 8900, topFormat: "Threads" },
  ],
  topContent: [
    { title: "Why Specialty Coffee Costs More", platform: "Instagram", type: "Reel", engagement: 8.4, reach: 12400, saves: 890 },
    { title: "5 Coffee Growing Regions", platform: "Instagram", type: "Carousel", engagement: 7.2, reach: 9800, saves: 720 },
    { title: "We Partner With 40 Women-Led Farms", platform: "LinkedIn", type: "Article", engagement: 6.8, reach: 7200, saves: 340 },
    { title: "Brewing pH Science Thread", platform: "X", type: "Thread", engagement: 5.9, reach: 5600, saves: 180 },
  ],
  insights: [
    { type: "win", text: "Reels are outperforming static posts by 2.8× on Instagram this month." },
    { type: "win", text: "Sustainability-pillar content generates 34% more saves than average." },
    { type: "opportunity", text: "LinkedIn articles posted Tuesday 9-11am get 41% more clicks." },
    { type: "warning", text: "Engagement rate dropped 12% on X posts with hashtags > 3." },
  ],
};

export const campaigns = [
  {
    id: "camp1",
    name: "Back to Brew Season",
    goal: "Brand Awareness",
    status: "active",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    platforms: ["Instagram", "LinkedIn", "X"],
    totalContent: 24,
    published: 14,
    approved: 6,
    pending: 4,
    budget: "$0 (organic)",
    impressions: 186000,
    engagement: 7840,
    clicks: 3200,
    color: "#7C3AED",
  },
  {
    id: "camp2",
    name: "Origin Stories Series",
    goal: "Establish Industry Expertise",
    status: "planned",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    platforms: ["Instagram", "YouTube"],
    totalContent: 18,
    published: 0,
    approved: 3,
    pending: 15,
    budget: "$0 (organic)",
    impressions: 0,
    engagement: 0,
    clicks: 0,
    color: "#2563EB",
  },
  {
    id: "camp3",
    name: "Cold Brew Summer",
    goal: "Product Conversion",
    status: "completed",
    startDate: "2026-06-01",
    endDate: "2026-07-31",
    platforms: ["Instagram", "X"],
    totalContent: 32,
    published: 32,
    approved: 32,
    pending: 0,
    budget: "$0 (organic)",
    impressions: 312000,
    engagement: 14200,
    clicks: 6800,
    color: "#10B981",
  },
];

export const seoData = {
  keywords: [
    { keyword: "specialty coffee subscription", volume: 14800, difficulty: 42, position: 18, opportunity: "High" },
    { keyword: "single origin coffee", volume: 22000, difficulty: 61, position: 34, opportunity: "Medium" },
    { keyword: "sustainable coffee brands", volume: 8900, difficulty: 38, position: 9, opportunity: "High" },
    { keyword: "cold brew coffee guide", volume: 33000, difficulty: 29, position: 47, opportunity: "High" },
    { keyword: "ethiopian yirgacheffe coffee", volume: 5400, difficulty: 22, position: 12, opportunity: "High" },
    { keyword: "coffee brewing methods comparison", volume: 18000, difficulty: 45, position: 28, opportunity: "Medium" },
    { keyword: "best coffee beans 2026", volume: 27000, difficulty: 58, position: null, opportunity: "Medium" },
    { keyword: "fair trade coffee certification", volume: 6200, difficulty: 31, position: 15, opportunity: "High" },
  ],
  organicTraffic: [
    { month: "Feb", traffic: 1240 },
    { month: "Mar", traffic: 1680 },
    { month: "Apr", traffic: 2100 },
    { month: "May", traffic: 2480 },
    { month: "Jun", traffic: 3200 },
    { month: "Jul", traffic: 3890 },
    { month: "Aug", traffic: 4340 },
  ],
  contentGaps: [
    { topic: "How to brew pour-over at home", volume: 12000, difficulty: 24, status: "Not created" },
    { topic: "Coffee processing methods explained", volume: 8400, difficulty: 19, status: "Not created" },
    { topic: "Why coffee prices are rising 2026", volume: 19000, difficulty: 33, status: "Draft" },
    { topic: "Best coffee grinders under $100", volume: 31000, difficulty: 55, status: "Not created" },
  ],
};

export const connectedPlatforms = [
  { id: "ig1", platform: "Instagram", account: "@novabrew_official", type: "Business", status: "connected", followers: 18400, lastSync: "2m ago" },
  { id: "li1", platform: "LinkedIn", account: "NovaBrew Coffee", type: "Company Page", status: "connected", followers: 4200, lastSync: "5m ago" },
  { id: "x1", platform: "X", account: "@novabrewco", type: "Profile", status: "connected", followers: 6800, lastSync: "12m ago" },
  { id: "yt1", platform: "YouTube", account: "NovaBrew Coffee", type: "Channel", status: "disconnected", followers: null, lastSync: null },
  { id: "tk1", platform: "TikTok", account: null, type: null, status: "not_connected", followers: null, lastSync: null },
];

export const approvalQueue = [
  {
    id: "aq1",
    title: "Why Specialty Coffee Commands Premium Prices",
    platform: "LinkedIn",
    type: "Article",
    scheduledFor: "Aug 12, 2026 • 9:00 AM",
    scores: { brandFit: 94, seoScore: 87, originality: 91, factuality: 96, ctaQuality: 82 },
    preview: "In the world of specialty coffee, price is rarely arbitrary. Every dollar reflects a chain of intentional decisions — from the altitude at which a bean is grown to the temperature at which it's roasted...",
    pillar: "Education",
  },
  {
    id: "aq2",
    title: "Cold Brew in 5 Minutes: Our Secret Method",
    platform: "Instagram",
    type: "Reel",
    scheduledFor: "Aug 13, 2026 • 6:00 PM",
    scores: { brandFit: 88, seoScore: 71, originality: 85, factuality: 90, ctaQuality: 94 },
    preview: "Hook: You've been cold brewing wrong. Here's the NovaBrew method that takes 5 minutes of prep and 12 hours of patience...",
    pillar: "Product",
  },
  {
    id: "aq3",
    title: "Coffee Ceremony: Ethiopia's Living Tradition",
    platform: "X",
    type: "Thread",
    scheduledFor: "Aug 14, 2026 • 8:00 AM",
    scores: { brandFit: 91, seoScore: 78, originality: 96, factuality: 93, ctaQuality: 76 },
    preview: "1/ Ethiopia isn't just where coffee was discovered. It's where coffee is a language. A 3-hour ceremony. A conversation between generations. Let me tell you why this matters for your morning cup 🧵",
    pillar: "Education",
  },
];

export const kpiSummary = {
  totalFollowers: 29400,
  followerGrowth: 6.8,
  avgEngagementRate: 4.7,
  engagementGrowthPct: 12.3,
  totalImpressions: 186000,
  impressionGrowthPct: 23.1,
  contentPublished: 52,
  contentThisMonth: 14,
  campaignsActive: 1,
  approvalsPending: 3,
  seoPosition: 9,
  organicTraffic: 4340,
};

export const copilotHistory = [
  {
    role: "user",
    content: "Why did LinkedIn engagement drop last week?"
  },
  {
    role: "assistant",
    content: "**Observation:** LinkedIn engagement dropped 18% week-over-week (from 4.2% to 3.4% avg engagement rate).\n\n**Likely Cause:** Your 3 posts last week were all published on Friday afternoon — LinkedIn's lowest-engagement window. Additionally, all 3 were image-only posts; your audience responds 2.3× better to articles and carousels.\n\n**Recommendation:** Shift LinkedIn publishing to Tuesday–Thursday, 8–10am. Prioritize articles and document carousels over static images. Schedule at least 1 article per week to maintain your position as an industry expert."
  },
];
