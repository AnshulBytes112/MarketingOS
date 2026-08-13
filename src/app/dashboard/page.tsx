/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/static-components */
"use client";

import { kpiSummary, performanceData, approvalQueue, brandDNA } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Users, Eye, FileText, AlertCircle, Zap, ArrowUp, Search, Sparkles, Send, BarChart3, CheckCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const kpis = [
  { label: "Total Followers",   value: kpiSummary.totalFollowers.toLocaleString(), change: `+${kpiSummary.followerGrowth}%`,       icon: Users,      color: "#7c3aed" },
  { label: "Avg Engagement",    value: `${kpiSummary.avgEngagementRate}%`,          change: `+${kpiSummary.engagementGrowthPct}%`, icon: TrendingUp, color: "#2563eb" },
  { label: "Total Impressions", value: `${(kpiSummary.totalImpressions/1000).toFixed(0)}K`, change: `+${kpiSummary.impressionGrowthPct}%`, icon: Eye, color: "#10b981" },
  { label: "Content Published", value: kpiSummary.contentPublished,                change: `+${kpiSummary.contentThisMonth} this month`, icon: FileText, color: "#f59e0b" },
  { label: "Pending Approvals", value: kpiSummary.approvalsPending,                change: "Needs review",                        icon: AlertCircle, color: "#ef4444" },
  { label: "SEO Traffic",       value: kpiSummary.organicTraffic.toLocaleString(), change: `Rank #${kpiSummary.seoPosition}`,      icon: Search,     color: "#8b5cf6" },
];

const quickActions = [
  { label: "Generate Content", icon: Sparkles, color: "#7c3aed" },
  { label: "Review Queue",     icon: CheckCircle, color: "#10b981" },
  { label: "Publish Now",      icon: Send,    color: "#2563eb" },
  { label: "View Analytics",   icon: BarChart3, color: "#f59e0b" },
];

export default function DashboardPage() {
  const tooltipStyle = {
    background: "var(--bg-solid)",
    border: "1px solid var(--border)",
    borderRadius: "0.625rem",
    fontSize: "0.75rem",
    color: "var(--text-primary)",
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div style={{ ...tooltipStyle, padding: "0.625rem 0.875rem" }}>
        <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
        {payload.map((p: any) => <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value?.toLocaleString()}</div>)}
      </div>
    );
    return null;
  };

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Welcome banner */}
        <div className="card" style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(37,99,235,0.06) 100%)",
          border: "1px solid rgba(124,58,237,0.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          animation: "fadeInUp 0.4s ease both",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
              <Zap size={16} color="#7c3aed" />
              <span className="section-label" style={{ color: "#7c3aed" }}>AI Marketing OS</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-space)", fontSize: "1.375rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Good evening, NovaBrew ☕
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              3 pieces pending approval · 1 campaign active · Engagement up 12.3% this week
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {quickActions.map(({ label, icon: Icon, color }) => (
              <button key={label} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem" }}>
                <Icon size={14} color={color} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.875rem" }}>
          {kpis.map(({ label, value, change, icon: Icon, color }, i) => (
            <div key={label} className="card glass-hover" style={{ animation: `fadeInUp ${0.1 + i * 0.05}s ease both` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "8px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={15} color={color} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.7rem", color: "#10b981" }}>
                  <ArrowUp size={10} />
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-space)", fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{label}</div>
              <div style={{ fontSize: "0.7rem", color: "#10b981", marginTop: "0.375rem" }}>{change}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="card" style={{ animation: "fadeInUp 0.5s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9375rem" }}>Impressions & Reach</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Last 6 weeks</div>
              </div>
              <span className="badge badge-active">+23.1%</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={performanceData.weekly}>
                <defs>
                  <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#7c3aed" fill="url(#gI)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="reach" name="Reach" stroke="#2563eb" fill="url(#gR)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ animation: "fadeInUp 0.55s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9375rem" }}>Engagement & Clicks</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Last 6 weeks</div>
              </div>
              <span className="badge badge-approved">+12.3%</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={performanceData.weekly}>
                <defs>
                  <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#10b981" fill="url(#gE)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#f59e0b" fill="url(#gC)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1rem" }}>
          <div className="card" style={{ animation: "fadeInUp 0.6s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9375rem" }}>Approval Queue</div>
              <span className="badge badge-review">{approvalQueue.length} pending</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {approvalQueue.map(item => (
                <div key={item.id} className="glass-hover" style={{
                  padding: "0.75rem", borderRadius: "0.625rem",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  display: "flex", alignItems: "center", gap: "0.75rem",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "8px", flexShrink: 0,
                    background: "rgba(124,58,237,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.6rem", fontWeight: 700, color: "#7c3aed",
                  }}>
                    {item.type.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{item.platform} · {item.scheduledFor}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: `conic-gradient(#7c3aed ${item.scores.brandFit * 3.6}deg, var(--border) 0deg)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.65rem", fontWeight: 700, color: "#7c3aed",
                    }}>
                      {item.scores.brandFit}
                    </div>
                    <button className="btn-primary" style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem" }}>Review</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ animation: "fadeInUp 0.65s ease both" }}>
            <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9375rem", marginBottom: "1rem" }}>Brand DNA</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {brandDNA.contentPillars.map(p => (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>{p.name}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: p.color }}>{p.weight}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${p.weight}%`, background: p.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {brandDNA.personality.map(t => <span key={t} className="badge badge-active" style={{ fontSize: "0.7rem" }}>{t}</span>)}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
