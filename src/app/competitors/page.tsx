/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer 
} from "recharts";
import { 
  Search, Filter, Eye, TrendingUp, Users, Zap, ArrowUpRight, ArrowRight, Sparkles, 
  Flame, Award, Target, MessageSquare, ThumbsUp, Share2, ExternalLink, Play, CheckCircle2,
  AlertTriangle, ShieldAlert, BarChart3, Radio, Compass
} from "lucide-react";
import Link from "next/link";

// Platform icons mapping & branding
const platformColors: Record<string, { bg: string; text: string; border: string }> = {
  Instagram: { bg: "rgba(225, 48, 108, 0.12)", text: "#e1306c", border: "rgba(225, 48, 108, 0.3)" },
  YouTube:   { bg: "rgba(255, 0, 0, 0.12)",   text: "#ff0000", border: "rgba(255, 0, 0, 0.3)" },
  Facebook:  { bg: "rgba(24, 119, 242, 0.12)", text: "#1877f2", border: "rgba(24, 119, 242, 0.3)" },
  LinkedIn:  { bg: "rgba(10, 102, 194, 0.12)", text: "#0a66c2", border: "rgba(10, 102, 194, 0.3)" },
  X:         { bg: "rgba(29, 161, 242, 0.12)", text: "#1da1f2", border: "rgba(29, 161, 242, 0.3)" }
};

const competitorProfiles = [
  {
    id: "comp1",
    name: "BluePeak Coffee Roasters",
    handle: "@bluepeakcoffee",
    color: "#3b82f6",
    score: 84,
    followers: "148.5K",
    growth: "+4.2%",
    avgReach: "48.2K / post",
    avgEngagement: "4.8%",
    postsPerWeek: 6,
    platforms: [
      { platform: "Instagram", handle: "@bluepeakcoffee", followers: "84.2K", status: "Active" },
      { platform: "YouTube", handle: "BluePeak Roasts", followers: "42.0K", status: "Active" },
      { platform: "Facebook", handle: "BluePeak Coffee Co", followers: "22.3K", status: "Moderate" }
    ],
    audience: {
      primaryAge: "25-34 (58%)",
      gender: "54% Female / 46% Male",
      topInterests: ["Espresso Tech", "Home Brewing", "Specialty Roasting"],
      sentiment: "88% Positive"
    },
    strengths: ["High-frequency Reel posting", "Aesthetic minimalist packaging shots"],
    weaknesses: ["Lacks origin elevation science", "Low comment response rate"]
  },
  {
    id: "comp2",
    name: "GroundLevel Specialty Roasters",
    handle: "@groundlevel",
    color: "#8b5cf6",
    score: 78,
    followers: "112.0K",
    growth: "+2.8%",
    avgReach: "36.8K / post",
    avgEngagement: "5.7%",
    postsPerWeek: 4,
    platforms: [
      { platform: "Instagram", handle: "@groundlevel", followers: "62.4K", status: "Active" },
      { platform: "YouTube", handle: "GroundLevel Channel", followers: "31.6K", status: "Active" },
      { platform: "LinkedIn", handle: "GroundLevel Roasters", followers: "18.0K", status: "Moderate" }
    ],
    audience: {
      primaryAge: "28-40 (64%)",
      gender: "60% Male / 40% Female",
      topInterests: ["Cold Brew Tech", "Barista Science", "Direct Trade"],
      sentiment: "92% Positive"
    },
    strengths: ["In-depth barista technique videos", "Strong LinkedIn B2B reach"],
    weaknesses: ["Inconsistent posting schedule", "Weak hashtag strategy"]
  },
  {
    id: "comp3",
    name: "The Daily Grind Co.",
    handle: "@dailygrindco",
    color: "#10b981",
    score: 72,
    followers: "89.4K",
    growth: "+5.4%",
    avgReach: "24.5K / post",
    avgEngagement: "3.2%",
    postsPerWeek: 5,
    platforms: [
      { platform: "LinkedIn", handle: "The Daily Grind Co", followers: "38.0K", status: "Active" },
      { platform: "Facebook", handle: "@dailygrindco", followers: "31.4K", status: "Active" },
      { platform: "Instagram", handle: "@dailygrind_official", followers: "20.0K", status: "Moderate" }
    ],
    audience: {
      primaryAge: "30-45 (70%)",
      gender: "50% Male / 50% Female",
      topInterests: ["Coffee & Business", "Office Perk Subscriptions", "Sustainability"],
      sentiment: "84% Positive"
    },
    strengths: ["High corporate subscription conversion", "Thought leadership articles"],
    weaknesses: ["No video content or Reels", "Generic product visuals"]
  },
  {
    id: "comp4",
    name: "RoastMaster Pro",
    handle: "@roastmasterpro",
    color: "#f59e0b",
    score: 89,
    followers: "215.0K",
    growth: "+8.1%",
    avgReach: "92.0K / post",
    avgEngagement: "6.4%",
    postsPerWeek: 7,
    platforms: [
      { platform: "YouTube", handle: "RoastMaster Pro TV", followers: "125.0K", status: "Active" },
      { platform: "Instagram", handle: "@roastmasterpro", followers: "65.0K", status: "Active" },
      { platform: "X", handle: "@roastmaster_pro", followers: "25.0K", status: "Active" }
    ],
    audience: {
      primaryAge: "20-34 (68%)",
      gender: "65% Male / 35% Female",
      topInterests: ["Biohacking Coffee", "Roast Temperature Curves", "Coffee Equipment"],
      sentiment: "94% Positive"
    },
    strengths: ["Viral YouTube Shorts reach", "High engagement biohacking angle"],
    weaknesses: ["Overly technical language for casual drinkers", "No direct e-commerce CTA"]
  }
];

// LIVE DAILY COMPETITOR POST STREAM (EVIDENCE + METRICS)
const dailyCompetitorPosts = [
  {
    id: "post1",
    competitorId: "comp1",
    competitorName: "BluePeak Coffee Roasters",
    handle: "@bluepeakcoffee",
    platform: "Instagram",
    format: "Reel (9:16 Video)",
    timeAgo: "4 hours ago",
    thumbnail: "/images/ai_roasting_masterclass.png",
    title: "5 Signs Your Espresso Grind is Too Fine",
    caption: "If your shot takes 45s+ and tastes intensely sour, your grind size is choking the basket! Here's how to recalibrate your grinder dial in 30 seconds... ☕️ #EspressoTips #HomeBarista",
    metrics: { reach: "142.8K", likes: "12.4K", comments: "384", shares: "1.2K", engagementRate: "8.6%" },
    audienceReaction: "High interest in grind sizes. 42 users asked about altitude bean hardness.",
    counterMeasure: {
      action: "Publish 45s Counter Reel: 'Why Altitude Controls Bean Hardness & Grind Dial'",
      why: "BluePeak missed the bean altitude factor. Your Yirgacheffe 2,000m beans are denser and require specific grind adjustments.",
      expectedAdvantage: "+40% higher saves & positioning authority",
      suggestedPlatform: "Instagram / TikTok"
    }
  },
  {
    id: "post2",
    competitorId: "comp2",
    competitorName: "GroundLevel Specialty Roasters",
    handle: "GroundLevel Channel",
    platform: "YouTube",
    format: "Video (16:9 Long-Form)",
    timeAgo: "1 day ago",
    thumbnail: "/images/ai_cold_brew_lifestyle.png",
    title: "Ultimate Cold Brew Ratio Masterclass (12:1 vs 8:1)",
    caption: "We tested 4 ratio variations over 24 hours to find the sweetest cold brew extraction without stringency or mud. Watch the full breakdown test!",
    metrics: { reach: "89.2K", likes: "6.2K", comments: "512", shares: "410", engagementRate: "7.1%" },
    audienceReaction: "Viewers complained that 24 hours takes too long and tastes flat.",
    counterMeasure: {
      action: "Publish YouTube Short: '5-Minute Hot Bloom Cold Brew Technique'",
      why: "Audience wants faster cold brew with brighter floral top-notes. Highlight NovaBrew's 5-minute hot bloom method.",
      expectedAdvantage: "Capture impatient cold brew seekers",
      suggestedPlatform: "YouTube Shorts / Instagram Reel"
    }
  },
  {
    id: "post3",
    competitorId: "comp3",
    competitorName: "The Daily Grind Co.",
    handle: "The Daily Grind Co",
    platform: "LinkedIn",
    format: "Carousel Slide Deck",
    timeAgo: "2 days ago",
    thumbnail: "/images/ai_carousel_infographic.png",
    title: "Why Direct-Trade Coffee Margins Are Shifting in 2026",
    caption: "Specialty coffee trade models are changing. Here is our breakdown of farm-gate pricing vs commodity exchange rates for office buyers.",
    metrics: { reach: "34.5K", likes: "2.1K", comments: "148", shares: "380", engagementRate: "6.5%" },
    audienceReaction: "Strong B2B corporate office buyer engagement.",
    counterMeasure: {
      action: "Publish LinkedIn Article: 'The 2.8x Fair Trade Benchmark: NovaBrew Impact Report'",
      why: "Their post lacked transparent farmer payout numbers. NovaBrew's 2.8x commodity rate data will dominate the discussion.",
      expectedAdvantage: "Direct lead gen for corporate subscriptions",
      suggestedPlatform: "LinkedIn Article"
    }
  },
  {
    id: "post4",
    competitorId: "comp1",
    competitorName: "BluePeak Coffee Roasters",
    handle: "BluePeak Official",
    platform: "Facebook",
    format: "Product Launch Photo",
    timeAgo: "3 days ago",
    thumbnail: "/images/ai_packaging_showcase.png",
    title: "New Ethiopian Micro-Lot Bag Drop",
    caption: "Introducing our seasonal micro-lot drop in matte black foil pouches. Limited to 1,000 bags online now!",
    metrics: { reach: "56.0K", likes: "3.8K", comments: "192", shares: "215", engagementRate: "4.9%" },
    audienceReaction: "Users asking if it's organic certified and high-altitude dry air processed.",
    counterMeasure: {
      action: "Launch Promo Post: 'High-Altitude 2,100m Organic Single-Origin Bag Drop'",
      why: "BluePeak didn't specify altitude or organic certifications. Highlight NovaBrew's eco credentials.",
      expectedAdvantage: "Higher conversion rate among conscious buyers",
      suggestedPlatform: "Facebook / Instagram"
    }
  }
];

const radarComparisonData = [
  { metric: "Engagement Rate", NovaBrew: 5.2, BluePeak: 4.8, GroundLevel: 5.7, DailyGrind: 3.2, RoastMaster: 6.4 },
  { metric: "Reels/Shorts Vol", NovaBrew: 6.5, BluePeak: 8.0, GroundLevel: 4.5, DailyGrind: 1.0, RoastMaster: 9.5 },
  { metric: "Brand Sentiment", NovaBrew: 9.2, BluePeak: 8.8, GroundLevel: 9.2, DailyGrind: 8.4, RoastMaster: 9.4 },
  { metric: "SEO Alignment", NovaBrew: 8.8, BluePeak: 7.2, GroundLevel: 6.8, DailyGrind: 7.9, RoastMaster: 8.5 },
  { metric: "Topic Diversity", NovaBrew: 9.0, BluePeak: 7.5, GroundLevel: 6.5, DailyGrind: 5.8, RoastMaster: 8.2 },
];

export default function CompetitorsPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "directory" | "counterplaybook">("feed");
  const [platformFilter, setPlatformFilter] = useState<string>("All");
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>(competitorProfiles[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const compDetail = competitorProfiles.find(c => c.id === selectedCompetitor) || competitorProfiles[0];

  const filteredPosts = dailyCompetitorPosts.filter(post => {
    const matchesPlatform = platformFilter === "All" || post.platform === platformFilter;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.competitorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        
        {/* PAGE HEADER */}
        <div className="card" style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 50%, rgba(16,185,129,0.06) 100%)",
          border: "1px solid rgba(37,99,235,0.25)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className="badge badge-active" style={{ background: "rgba(37,99,235,0.15)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.3)" }}>
                  <Compass size={13} /> Competitor Intelligence Radar 3.0
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Radio size={12} color="#10b981" /> Live Social Monitoring Active
                </span>
              </div>
              <h1 style={{ fontFamily: "var(--font-space)", fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Multi-Platform Competitor Feed & Counter-Playbook
              </h1>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.375rem", maxWidth: "800px" }}>
                Monitor daily posts, reach metrics, audience reactions, and specific social handles across Instagram, YouTube, Facebook, LinkedIn & X — with AI actionable measures to out-compete them.
              </p>
            </div>

            {/* KEY SUMMARY STATS */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ padding: "0.625rem 0.875rem", background: "var(--surface-2)", borderRadius: "0.625rem", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 600 }}>Tracked Competitors</div>
                <div style={{ fontFamily: "var(--font-space)", fontSize: "1rem", fontWeight: 700, color: "#2563eb" }}>4 Brands (12 Channels)</div>
              </div>
              <div style={{ padding: "0.625rem 0.875rem", background: "var(--surface-2)", borderRadius: "0.625rem", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 600 }}>Daily Post Volume</div>
                <div style={{ fontFamily: "var(--font-space)", fontSize: "1rem", fontWeight: 700, color: "#10b981" }}>~22 Posts / Week</div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              onClick={() => setActiveTab("feed")} 
              className={activeTab === "feed" ? "btn-primary" : "btn-ghost"}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", borderRadius: "0.625rem" }}
            >
              <Flame size={14} /> Live Daily Post Stream ({filteredPosts.length})
            </button>
            <button 
              onClick={() => setActiveTab("counterplaybook")} 
              className={activeTab === "counterplaybook" ? "btn-primary" : "btn-ghost"}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", borderRadius: "0.625rem" }}
            >
              <Zap size={14} /> AI Actionable Counter-Playbook
            </button>
            <button 
              onClick={() => setActiveTab("directory")} 
              className={activeTab === "directory" ? "btn-primary" : "btn-ghost"}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", borderRadius: "0.625rem" }}
            >
              <Users size={14} /> Competitor Profile Radar
            </button>
          </div>

          {/* SEARCH BAR */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ position: "relative", width: 240 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                type="text" 
                placeholder="Search posts or competitors..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: 30, fontSize: "0.75rem", height: 34 }}
              />
            </div>
          </div>
        </div>

        {/* PLATFORM FILTERS BAR (Requested by user) */}
        <div className="card" style={{ padding: "0.75rem 1rem", background: "var(--surface-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
              <Filter size={13} /> FILTER BY PLATFORM:
            </div>
            {["All", "Instagram", "YouTube", "Facebook", "LinkedIn", "X"].map(plat => {
              const isSelected = platformFilter === plat;
              const styleConfig = platformColors[plat] || { bg: "rgba(124,58,237,0.12)", text: "#7c3aed", border: "#7c3aed" };
              return (
                <button
                  key={plat}
                  onClick={() => setPlatformFilter(plat)}
                  style={{
                    padding: "0.35rem 0.875rem",
                    borderRadius: "99px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `1px solid ${isSelected ? styleConfig.text : "var(--border)"}`,
                    background: isSelected ? styleConfig.bg : "var(--bg-solid)",
                    color: isSelected ? styleConfig.text : "var(--text-secondary)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  }}
                >
                  {plat}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: LIVE DAILY POST STREAM & COUNTER-PLAYBOOK */}
        {activeTab === "feed" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeInUp 0.3s ease both" }}>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <div className="section-label" style={{ marginBottom: 2 }}>Daily Evidence Stream</div>
                  <h2 style={{ fontFamily: "var(--font-space)", fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                    Recent Daily Posts Published by Competitors
                  </h2>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Updated 15 mins ago</span>
              </div>

              {/* POST STREAM GRID */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {filteredPosts.map(post => {
                  const styleConfig = platformColors[post.platform] || { bg: "rgba(124,58,237,0.12)", text: "#7c3aed", border: "#7c3aed" };
                  return (
                    <div 
                      key={post.id} 
                      className="glass-hover"
                      style={{ 
                        padding: "1.25rem", 
                        borderRadius: "0.875rem", 
                        border: "1px solid var(--border)", 
                        background: "var(--surface-2)",
                        display: "grid",
                        gridTemplateColumns: "220px 1fr 300px",
                        gap: "1.25rem",
                        alignItems: "flex-start"
                      }}
                    >
                      {/* POST THUMBNAIL */}
                      <div>
                        <div style={{ position: "relative", borderRadius: "0.625rem", overflow: "hidden", height: 130, border: "1px solid var(--border)", background: "#000" }}>
                          <Image src={post.thumbnail} alt={post.title} width={300} height={130} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <span style={{ 
                            position: "absolute", top: 8, left: 8, 
                            padding: "0.25rem 0.5rem", borderRadius: "0.375rem", 
                            background: styleConfig.bg, color: styleConfig.text, border: `1px solid ${styleConfig.border}`,
                            fontSize: "0.65rem", fontWeight: 700, backdropFilter: "blur(4px)" 
                          }}>
                            {post.platform} • {post.format}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                          <Radio size={11} color="#10b981" /> Published {post.timeAgo}
                        </div>
                      </div>

                      {/* POST CAPTION & REACH DATA */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            {post.competitorName}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {post.handle}
                          </span>
                        </div>

                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.375rem" }}>
                          "{post.title}"
                        </div>

                        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "0.875rem" }}>
                          {post.caption}
                        </p>

                        {/* METRICS ROW */}
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Reach: <span style={{ fontWeight: 700, color: "#2563eb" }}>{post.metrics.reach}</span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Likes: <span style={{ fontWeight: 700, color: "#e1306c" }}>{post.metrics.likes}</span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Comments: <span style={{ fontWeight: 700, color: "#10b981" }}>{post.metrics.comments}</span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Engagement Rate: <span style={{ fontWeight: 700, color: "#7c3aed" }}>{post.metrics.engagementRate}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI COUNTER-MEASURE RECOMMENDATION CARD */}
                      <div style={{ 
                        padding: "1rem", 
                        borderRadius: "0.75rem", 
                        background: "rgba(124,58,237,0.08)", 
                        border: "1px solid rgba(124,58,237,0.25)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <Zap size={14} color="#7c3aed" />
                          <span style={{ fontSize: "0.725rem", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Measure You Should Take
                          </span>
                        </div>

                        <div style={{ fontSize: "0.785rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {post.counterMeasure.action}
                        </div>

                        <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
                          {post.counterMeasure.why}
                        </p>

                        <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#10b981", marginTop: 2 }}>
                          ⚡ {post.counterMeasure.expectedAdvantage}
                        </div>

                        <Link 
                          href="/content" 
                          className="btn-primary" 
                          style={{ 
                            marginTop: "0.375rem", 
                            padding: "0.4rem", 
                            fontSize: "0.725rem", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            gap: 4,
                            textDecoration: "none" 
                          }}
                        >
                          <Sparkles size={12} /> Generate Counter Content
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPETITOR ACTIONABLE COUNTER-PLAYBOOK */}
        {activeTab === "counterplaybook" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeInUp 0.3s ease both" }}>
            <div className="card">
              <div className="section-label" style={{ marginBottom: 4 }}>AI Strategic Counter-Playbook</div>
              <h2 style={{ fontFamily: "var(--font-space)", fontSize: "1.25rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>
                Strategic Counter-Measures & Opportunities Matrix
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                {dailyCompetitorPosts.map((post, idx) => (
                  <div key={post.id} className="card" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span className="badge badge-active">{post.competitorName}</span>
                      <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700 }}>High Priority Opportunity</span>
                    </div>

                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                      Target Post: "{post.title}" ({post.platform})
                    </h3>

                    <div style={{ padding: "0.75rem", background: "var(--surface)", borderRadius: "0.5rem", border: "1px solid var(--border)", marginBottom: "0.875rem" }}>
                      <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, marginBottom: 2 }}>Audience Reaction / Vulnerability</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{post.audienceReaction}</div>
                    </div>

                    <div style={{ padding: "0.75rem", background: "rgba(16,185,129,0.08)", borderRadius: "0.5rem", border: "1px solid rgba(16,185,129,0.25)", marginBottom: "0.875rem" }}>
                      <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", color: "#10b981", fontWeight: 700, marginBottom: 2 }}>Recommended Counter Action</div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{post.counterMeasure.action}</div>
                      <div style={{ fontSize: "0.725rem", color: "var(--text-secondary)" }}>{post.counterMeasure.why}</div>
                    </div>

                    <Link href="/content" className="btn-primary" style={{ width: "100%", padding: "0.5rem", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}>
                      <Sparkles size={13} /> Auto-Generate Counter Campaign
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPETITOR PROFILE DIRECTORY & RADAR BENCHMARK */}
        {activeTab === "directory" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeInUp 0.3s ease both" }}>
            
            {/* COMPETITOR ACCOUNTS SELECTOR GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.875rem" }}>
              {competitorProfiles.map(c => {
                const isSelected = selectedCompetitor === c.id;
                return (
                  <div 
                    key={c.id} 
                    className="card glass-hover" 
                    onClick={() => setSelectedCompetitor(c.id)} 
                    style={{
                      cursor: "pointer",
                      border: `1.5px solid ${isSelected ? c.color : "var(--border)"}`,
                      background: isSelected ? `${c.color}12` : "var(--bg-solid)",
                      padding: "1rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "0.5rem", background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: c.color }}>
                        {c.name.slice(0, 2)}
                      </div>
                      <span style={{ fontSize: "0.7rem", color: c.color, fontWeight: 700, background: `${c.color}15`, padding: "0.2rem 0.5rem", borderRadius: "6px" }}>
                        Score {c.score}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</div>
                    <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{c.handle}</div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem" }}>
                      <div style={{ padding: "0.4rem", background: "var(--surface-2)", borderRadius: "0.375rem" }}>
                        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Followers</div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>{c.followers}</div>
                      </div>
                      <div style={{ padding: "0.4rem", background: "var(--surface-2)", borderRadius: "0.375rem" }}>
                        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Growth</div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#10b981" }}>{c.growth}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SELECTED COMPETITOR DEEP DIVE & EVIDENCE */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.25rem" }}>
              
              {/* SOCIAL HANDLES EVIDENCE & AUDIENCE PROFILE */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <div className="section-label" style={{ marginBottom: 2 }}>Platform Evidence Details</div>
                    <h2 style={{ fontFamily: "var(--font-space)", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                      {compDetail.name} Social Accounts
                    </h2>
                  </div>
                  <span className="badge badge-active">{compDetail.handle}</span>
                </div>

                {/* PLATFORMS EVIDENCE BADGES */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.25rem" }}>
                  {compDetail.platforms.map(p => {
                    const styleConfig = platformColors[p.platform] || { bg: "rgba(124,58,237,0.12)", text: "#7c3aed", border: "#7c3aed" };
                    return (
                      <div key={p.platform} style={{ padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <span style={{ padding: "0.25rem 0.5rem", borderRadius: "0.375rem", background: styleConfig.bg, color: styleConfig.text, fontSize: "0.7rem", fontWeight: 700 }}>
                            {p.platform}
                          </span>
                          <div>
                            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)" }}>{p.handle}</div>
                            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{p.followers} Followers / Subs</div>
                          </div>
                        </div>
                        <span className="badge badge-active" style={{ fontSize: "0.65rem" }}>Verified Active</span>
                      </div>
                    );
                  })}
                </div>

                {/* AUDIENCE DEMOGRAPHICS & INTERESTS */}
                <div className="section-label" style={{ marginBottom: 6 }}>Audience Demographics & Interests</div>
                <div style={{ padding: "1rem", background: "var(--surface-2)", borderRadius: "0.75rem", border: "1px solid var(--border)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.875rem" }}>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Primary Age Demographics</div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>{compDetail.audience.primaryAge}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Audience Sentiment</div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#10b981", marginTop: 2 }}>{compDetail.audience.sentiment}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 4, fontWeight: 600 }}>TOP AUDIENCE INTERESTS:</div>
                  <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                    {compDetail.audience.topInterests.map(interest => (
                      <span key={interest} className="badge badge-active" style={{ fontSize: "0.7rem" }}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* COMPETITIVE RADAR CHART */}
              <div className="card">
                <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", fontSize: "0.95rem" }}>
                  Competitive Radar Matrix
                </div>
                <ResponsiveContainer width="100%" height={230}>
                  <RadarChart data={radarComparisonData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                    <Radar name="NovaBrew" dataKey="NovaBrew" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="BluePeak" dataKey="BluePeak" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={1.5} />
                    <Radar name="GroundLevel" dataKey="GroundLevel" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "0.5rem" }}>
                  {[["NovaBrew (You)", "#7c3aed"], ["BluePeak", "#3b82f6"], ["GroundLevel", "#8b5cf6"]].map(([n, c]) => (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />{n}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}

