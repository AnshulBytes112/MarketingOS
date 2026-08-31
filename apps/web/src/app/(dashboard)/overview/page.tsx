import { requireAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import { TenantRepository } from '@abge/tenant';
import Link from 'next/link';
import {
  Sparkles,
  PieChart,
  ArrowRight,
  Users,
  Radio,
  FileText,
} from 'lucide-react';

export default async function OverviewPage() {
  const session = await requireAuth();

  // Fetch or auto-provision real brand record from DB
  let brand = await prisma.brand.findFirst({
    where: { organizationId: session.organizationId },
  });

  if (!brand) {
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
    });

    brand = await prisma.brand.create({
      data: {
        organizationId: session.organizationId,
        name: org?.name ? `${org.name} Brand` : 'My Brand',
        industry: '',
        geography: '',
        priceSegment: '',
        websiteUrl: '',
        positioning: '',
        usp: '',
        targetAudience: '',
        onboardingStatus: 'ACTIVE',
      },
    });
  }

  // ══════════════════════════════════════════
  // REAL TIME STATISTICS & AGGREGATIONS
  // ══════════════════════════════════════════
  
  // Total Competitors
  const competitorsCount = await prisma.brandCompetitor.count({
    where: { organizationId: session.organizationId, brandId: brand.id }
  });

  // Total Competitor Channels Connected
  const accountsCount = await prisma.competitorAccount.count({
    where: { organizationId: session.organizationId, brandId: brand.id }
  });

  // Total Competitor Posts Ingested
  const postsCount = await prisma.competitorPost.count({
    where: { organizationId: session.organizationId, brandId: brand.id }
  });

  // Total Active AI Recommendations
  const activeRecsCount = await prisma.aIRecommendation.count({
    where: { organizationId: session.organizationId, brandId: brand.id, status: 'OPEN' }
  });

  // Real-time Follower (Audience) sum
  const followerStats = await prisma.competitorAccount.aggregate({
    where: { organizationId: session.organizationId, brandId: brand.id },
    _sum: { followerCount: true },
  });
  const totalAudience = followerStats._sum.followerCount || 0;

  // Real-time Post Engagement sum (likes + comments)
  const postStats = await prisma.competitorPost.aggregate({
    where: { organizationId: session.organizationId, brandId: brand.id },
    _sum: { likeCount: true, commentCount: true },
  });
  const totalLikes = postStats._sum.likeCount || 0;
  const totalComments = postStats._sum.commentCount || 0;
  const totalEngagement = totalLikes + totalComments;

  // ══════════════════════════════════════════
  // WEEK-OVER-WEEK DATA CALCULATION FOR CHARTS
  // ══════════════════════════════════════════
  const sixWeeksAgo = new Date();
  sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

  const posts = await prisma.competitorPost.findMany({
    where: {
      organizationId: session.organizationId,
      brandId: brand.id,
      publishedAt: { gte: sixWeeksAgo },
    },
    select: {
      publishedAt: true,
      likeCount: true,
      commentCount: true,
    },
  });

  const weeklyEngagement = [0, 0, 0, 0, 0, 0];
  const weeklyPosts = [0, 0, 0, 0, 0, 0];

  posts.forEach(post => {
    const ageInDays = Math.floor((Date.now() - post.publishedAt.getTime()) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.min(5, Math.floor(ageInDays / 7));
    const revIndex = 5 - weekIndex;
    if (revIndex >= 0 && revIndex <= 5) {
      weeklyEngagement[revIndex] += (post.likeCount || 0) + (post.commentCount || 0);
      weeklyPosts[revIndex] += 1;
    }
  });

  const maxWeeklyEngagement = Math.max(...weeklyEngagement, 100);
  const maxWeeklyPosts = Math.max(...weeklyPosts, 10);

  const xCoords = [40, 130, 220, 310, 400, 490];

  // Helper to build line path
  function buildPath(points: {x: number, y: number}[]) {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  }

  // Construct chart coordinates
  const postPoints = xCoords.map((x, i) => {
    const val = weeklyPosts[i];
    const y = 180 - (val / maxWeeklyPosts) * 160;
    return { x, y };
  });

  const engagementPoints = xCoords.map((x, i) => {
    const val = weeklyEngagement[i];
    const y = 180 - (val / maxWeeklyEngagement) * 160;
    return { x, y };
  });

  // Construct paths or use premium fallback if no data ingested yet
  const hasIngestedData = posts.length > 0;
  
  const postPathLine = hasIngestedData ? buildPath(postPoints) : "M 40 100 Q 115 120 190 85 T 340 70 T 490 50";
  const postPathArea = hasIngestedData ? `${postPathLine} L 490 180 L 40 180 Z` : "M 40 100 Q 115 120 190 85 T 340 70 T 490 50 L 490 180 L 40 180 Z";

  const engagementPathLine = hasIngestedData ? buildPath(engagementPoints) : "M 40 90 Q 115 100 190 60 T 340 80 T 490 40";
  const reachPathLine = hasIngestedData ? buildPath(xCoords.map((x, i) => ({ x, y: 180 - (weeklyEngagement[i] * 0.7 / maxWeeklyEngagement) * 160 }))) : "M 40 130 Q 115 140 190 115 T 340 100 T 490 85";
  const reachPathArea = hasIngestedData ? `${reachPathLine} L 490 180 L 40 180 Z` : "M 40 130 Q 115 140 190 115 T 340 100 T 490 85 L 490 180 L 40 180 Z";
  const clicksPathLine = hasIngestedData ? buildPath(xCoords.map((x, i) => ({ x, y: 180 - (weeklyPosts[i] * 0.4 / maxWeeklyPosts) * 160 }))) : "M 40 140 Q 115 150 190 120 T 340 130 T 490 100";

  // ══════════════════════════════════════════
  // PENDING STRATEGY / AI RECOMMENDATIONS QUEUE
  // ══════════════════════════════════════════
  const pendingRecommendations = await prisma.aIRecommendation.findMany({
    where: {
      organizationId: session.organizationId,
      brandId: brand.id,
      status: 'OPEN',
    },
    take: 3,
    include: {
      competitor: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const tenantRepo = new TenantRepository({ organizationId: session.organizationId });
  const brandDna = await tenantRepo.getActiveBrandDna(brand.id);

  // Content Pillars data
  let contentPillars = brandDna?.contentPillars as any[] || [];
  if (contentPillars.length === 0) {
    contentPillars = [
      { name: 'Education', percentage: 30, color: 'bg-purple-500', textColor: 'text-purple-400' },
      { name: 'Product', percentage: 25, color: 'bg-blue-500', textColor: 'text-blue-400' },
      { name: 'Sustainability', percentage: 20, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
      { name: 'Culture', percentage: 15, color: 'bg-amber-500', textColor: 'text-amber-400' },
      { name: 'Community', percentage: 10, color: 'bg-rose-500', textColor: 'text-rose-400' },
    ];
  }

  // Personality Tags
  const personalityString = brandDna?.personality || 'Authentic, Innovative, Sustainable, Sophisticated, Approachable';
  const personalityTags = personalityString.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Real-time Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Competitors */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Competitors</p>
            <h4 className="text-2xl font-bold text-white">{competitorsCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Monitored Channels */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Connected Channels</p>
            <h4 className="text-2xl font-bold text-white">{accountsCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Ingested Content */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ingested Posts</p>
            <h4 className="text-2xl font-bold text-white">{postsCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: AI Recommendations */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">AI Recommendations</p>
            <h4 className="text-2xl font-bold text-white">{activeRecsCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 1. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Impressions & Reach / Post Volume */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                {hasIngestedData ? "Weekly Content Frequency" : "Impressions & Reach"}
              </h3>
              <p className="text-xs text-gray-400">
                {hasIngestedData ? "Competitor posts published per week" : "Last 6 weeks"}
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-semibold">
              {hasIngestedData ? `${postsCount} total` : "+23.1%"}
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="w-full h-56 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y Labels */}
              <line x1="40" y1="20" x2="490" y2="20" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="24" fill="#6b7280" fontSize="10" textAnchor="end">
                {hasIngestedData ? maxWeeklyPosts : "80k"}
              </text>

              <line x1="40" y1="60" x2="490" y2="60" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="64" fill="#6b7280" fontSize="10" textAnchor="end">
                {hasIngestedData ? Math.round(maxWeeklyPosts * 0.75) : "60k"}
              </text>

              <line x1="40" y1="100" x2="490" y2="100" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="104" fill="#6b7280" fontSize="10" textAnchor="end">
                {hasIngestedData ? Math.round(maxWeeklyPosts * 0.5) : "40k"}
              </text>

              <line x1="40" y1="140" x2="490" y2="140" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="144" fill="#6b7280" fontSize="10" textAnchor="end">
                {hasIngestedData ? Math.round(maxWeeklyPosts * 0.25) : "20k"}
              </text>

              <line x1="40" y1="180" x2="490" y2="180" stroke="#262433" />
              <text x="30" y="184" fill="#6b7280" fontSize="10" textAnchor="end">0</text>

              {/* Path 1 */}
              <path d={postPathArea} fill="url(#purpleGrad)" />
              <path d={postPathLine} fill="none" stroke="#a855f7" strokeWidth="2.5" />

              {/* Path 2 */}
              <path d={reachPathArea} fill="url(#blueGrad)" />
              <path d={reachPathLine} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="flex justify-between pl-8 text-[11px] text-gray-500 font-medium">
            <span>6w ago</span>
            <span>5w ago</span>
            <span>4w ago</span>
            <span>3w ago</span>
            <span>2w ago</span>
            <span>This week</span>
          </div>
        </div>

        {/* Chart 2: Engagement & Clicks / Social Interaction */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                {hasIngestedData ? "Weekly Engagement Trend" : "Engagement & Clicks"}
              </h3>
              <p className="text-xs text-gray-400">
                {hasIngestedData ? "Competitor post likes & comments per week" : "Last 6 weeks"}
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              {hasIngestedData ? `${totalEngagement} total` : "+12.3%"}
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-56 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              <line x1="40" y1="20" x2="490" y2="20" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="24" fill="#6b7280" fontSize="10" textAnchor="end">
                {hasIngestedData ? maxWeeklyEngagement : "3000"}
              </text>

              <line x1="40" y1="60" x2="490" y2="60" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="64" fill="#6b7280" fontSize="10" textAnchor="end">
                {hasIngestedData ? Math.round(maxWeeklyEngagement * 0.75) : "2250"}
              </text>

              <line x1="40" y1="100" x2="490" y2="100" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="104" fill="#6b7280" fontSize="10" textAnchor="end">
                {hasIngestedData ? Math.round(maxWeeklyEngagement * 0.5) : "1500"}
              </text>

              <line x1="40" y1="140" x2="490" y2="140" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="144" fill="#6b7280" fontSize="10" textAnchor="end">
                {hasIngestedData ? Math.round(maxWeeklyEngagement * 0.25) : "750"}
              </text>

              <line x1="40" y1="180" x2="490" y2="180" stroke="#262433" />
              <text x="30" y="184" fill="#6b7280" fontSize="10" textAnchor="end">0</text>

              {/* Line 1 (Engagement) */}
              <path d={engagementPathLine} fill="none" stroke="#10b981" strokeWidth="2.5" />

              {/* Line 2 (Clicks/Mock reference) */}
              <path d={clicksPathLine} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="flex justify-between pl-8 text-[11px] text-gray-500 font-medium">
            <span>6w ago</span>
            <span>5w ago</span>
            <span>4w ago</span>
            <span>3w ago</span>
            <span>2w ago</span>
            <span>This week</span>
          </div>
        </div>
      </div>

      {/* 2. Bottom Grid: AI Recommendations Queue & Brand DNA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: AI Recommendations Queue */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">AI Strategy Recommendations</h3>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              {activeRecsCount} pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingRecommendations.map((item) => {
              const competitorInitials = item.competitor.name.substring(0, 2).toUpperCase();
              return (
                <div
                  key={item.id}
                  className="bg-[#181624]/70 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-purple-500/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#5b21b6] flex items-center justify-center text-xs font-bold text-purple-200 border border-purple-400/20">
                      {competitorInitials}
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-white line-clamp-1">{item.recommendation}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {item.competitor.name} · {item.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400">
                      <PieChart className="w-3.5 h-3.5" />
                    </div>
                    <Link
                      href={`/competitors/${item.competitorId}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              );
            })}

            {pendingRecommendations.length === 0 && (
              <div className="py-8 text-center border border-dashed border-white/5 rounded-xl space-y-2">
                <Sparkles className="w-8 h-8 text-purple-400/50 mx-auto" />
                <p className="text-sm font-medium text-white">No pending recommendations</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Add competitors and wait for ingestion to automatically generate AI strategy suggestions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Brand DNA */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Brand DNA</h3>
            <Link
              href="/brand"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium"
            >
              View Full Profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Content Pillars Progress Bars */}
          <div className="space-y-3.5">
            {contentPillars.map((pillar) => (
              <div key={pillar.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-300">{pillar.name}</span>
                  <span className={`font-semibold ${pillar.textColor}`}>{pillar.percentage}%</span>
                </div>
                <div className="w-full bg-[#1C1A2B] h-2 rounded-full overflow-hidden">
                  <div
                    className={`${pillar.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${pillar.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Personality Tags */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
            {personalityTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
