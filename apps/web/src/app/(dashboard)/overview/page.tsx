import { requireAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import { TenantRepository } from '@abge/tenant';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Send,
  BarChart2,
  PieChart,
  ArrowRight,
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
        name: org?.name ? `${org.name} Brand` : 'NovaBrew Coffee',
        industry: 'Food & Beverage',
        geography: 'United States',
        priceSegment: 'Premium',
        websiteUrl: 'novabrew.com',
        positioning: 'Sustainable specialty coffee for the modern professional',
        usp: 'Single-origin, ethically sourced beans with AI-powered roast profiles',
        targetAudience: 'Urban professionals 25-40',
        onboardingStatus: 'ACTIVE',
      },
    });
  }

  const brandName = brand.name || 'NovaBrew';

  // Sample pending approval items (wired dynamically with fallback)
  const approvalItems = [
    {
      id: '1',
      initials: 'AR',
      title: 'Why Specialty Coffee Commands Premium Prices',
      channel: 'LinkedIn',
      date: 'Aug 12, 2026 • 9:00 AM',
      bgColor: 'bg-[#5b21b6]',
    },
    {
      id: '2',
      initials: 'RE',
      title: 'Cold Brew in 5 Minutes: Our Secret Method',
      channel: 'Instagram',
      date: 'Aug 13, 2026 • 6:00 PM',
      bgColor: 'bg-[#1e1b4b]',
    },
    {
      id: '3',
      initials: 'TH',
      title: "Coffee Ceremony: Ethiopia's Living Tradition",
      channel: 'X',
      date: 'Aug 14, 2026 • 8:00 AM',
      bgColor: 'bg-[#3b0764]',
    },
  ];

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
      {/* 1. Analytics Charts Grid (Top Section matching Screenshot 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Impressions & Reach */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Impressions & Reach</h3>
              <p className="text-xs text-gray-400">Last 6 weeks</p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-semibold">
              +23.1%
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
              <text x="30" y="24" fill="#6b7280" fontSize="10" textAnchor="end">80k</text>

              <line x1="40" y1="60" x2="490" y2="60" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="64" fill="#6b7280" fontSize="10" textAnchor="end">60k</text>

              <line x1="40" y1="100" x2="490" y2="100" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="104" fill="#6b7280" fontSize="10" textAnchor="end">40k</text>

              <line x1="40" y1="140" x2="490" y2="140" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="144" fill="#6b7280" fontSize="10" textAnchor="end">20k</text>

              <line x1="40" y1="180" x2="490" y2="180" stroke="#262433" />
              <text x="30" y="184" fill="#6b7280" fontSize="10" textAnchor="end">0k</text>

              {/* Area 1 (Purple - Impressions) */}
              <path
                d="M 40 100 Q 115 120 190 85 T 340 70 T 490 50 L 490 180 L 40 180 Z"
                fill="url(#purpleGrad)"
              />
              <path
                d="M 40 100 Q 115 120 190 85 T 340 70 T 490 50"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
              />

              {/* Area 2 (Blue - Reach) */}
              <path
                d="M 40 130 Q 115 140 190 115 T 340 100 T 490 85 L 490 180 L 40 180 Z"
                fill="url(#blueGrad)"
              />
              <path
                d="M 40 130 Q 115 140 190 115 T 340 100 T 490 85"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between pl-8 text-[11px] text-gray-500 font-medium">
            <span>Jul 7</span>
            <span>Jul 14</span>
            <span>Jul 21</span>
            <span>Jul 28</span>
            <span>Aug 4</span>
            <span>Aug 11</span>
          </div>
        </div>

        {/* Chart 2: Engagement & Clicks */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Engagement & Clicks</h3>
              <p className="text-xs text-gray-400">Last 6 weeks</p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              +12.3%
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-56 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines & Y Labels */}
              <line x1="40" y1="20" x2="490" y2="20" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="24" fill="#6b7280" fontSize="10" textAnchor="end">3000</text>

              <line x1="40" y1="60" x2="490" y2="60" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="64" fill="#6b7280" fontSize="10" textAnchor="end">2250</text>

              <line x1="40" y1="100" x2="490" y2="100" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="104" fill="#6b7280" fontSize="10" textAnchor="end">1500</text>

              <line x1="40" y1="140" x2="490" y2="140" stroke="#262433" strokeDasharray="3 3" />
              <text x="30" y="144" fill="#6b7280" fontSize="10" textAnchor="end">750</text>

              <line x1="40" y1="180" x2="490" y2="180" stroke="#262433" />
              <text x="30" y="184" fill="#6b7280" fontSize="10" textAnchor="end">0</text>

              {/* Line 1 (Green - Engagement) */}
              <path
                d="M 40 90 Q 115 100 190 60 T 340 80 T 490 40"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Line 2 (Orange/Gold - Clicks) */}
              <path
                d="M 40 140 Q 115 150 190 120 T 340 130 T 490 100"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between pl-8 text-[11px] text-gray-500 font-medium">
            <span>Jul 7</span>
            <span>Jul 14</span>
            <span>Jul 21</span>
            <span>Jul 28</span>
            <span>Aug 4</span>
            <span>Aug 11</span>
          </div>
        </div>
      </div>

      {/* 2. Bottom Grid: Approval Queue (Left) & Brand DNA (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Approval Queue */}
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Approval Queue</h3>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              3 pending
            </span>
          </div>

          <div className="space-y-3">
            {approvalItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#181624]/70 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-purple-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${item.bgColor} flex items-center justify-center text-xs font-bold text-purple-200 border border-purple-400/20`}>
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.channel} · {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400">
                    <PieChart className="w-3.5 h-3.5" />
                  </div>
                  <Link
                    href="/content"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
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
