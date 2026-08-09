"use client";

import { campaigns } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Plus, CheckCircle, Clock, Send, Eye } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const barData = campaigns.map(c => ({
  name: c.name.split(" ").slice(0,2).join(" "),
  Impressions: c.impressions,
  Engagement:  c.engagement,
  Clicks:      c.clicks,
}));

export default function CampaignsPage() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div style={{ background:"var(--bg-solid)", border:"1px solid var(--border)", borderRadius:"0.625rem", padding:"0.625rem 0.875rem", fontSize:"0.75rem" }}>
        <div style={{ color:"var(--text-muted)", marginBottom:4 }}>{label}</div>
        {payload.map((p: any) => <div key={p.name} style={{ color:p.fill, fontWeight:600 }}>{p.name}: {p.value?.toLocaleString()}</div>)}
      </div>
    );
    return null;
  };

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2 style={{ fontFamily:"var(--font-space)", fontSize:"1.25rem", fontWeight:700, color:"var(--text-primary)", margin:0 }}>Campaigns</h2>
            <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginTop:2 }}>{campaigns.length} campaigns · 1 active · 1 planned</p>
          </div>
          <button className="btn-primary" style={{ display:"flex", alignItems:"center", gap:"0.375rem", fontSize:"0.8rem" }}>
            <Plus size={13} /> New Campaign
          </button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          {campaigns.map((c, i) => (
            <div key={c.id} className="card glass-hover" style={{ animation:`fadeInUp ${0.3+i*0.06}s ease both` }}>
              <div style={{ display:"flex", gap:"1.25rem", alignItems:"center" }}>
                <div style={{ width:4, height:70, borderRadius:99, background:c.color, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.625rem", marginBottom:"0.375rem" }}>
                    <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", fontSize:"0.9375rem" }}>{c.name}</div>
                    <span className={`badge badge-${c.status}`}>{c.status}</span>
                  </div>
                  <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>Goal: <span style={{ color:"var(--text-soft)" }}>{c.goal}</span></span>
                    <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{c.startDate} → {c.endDate}</span>
                    <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>Platforms: <span style={{ color:"var(--text-soft)" }}>{c.platforms.join(", ")}</span></span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginTop:"0.625rem" }}>
                    <div className="progress-bar" style={{ flex:1 }}>
                      <div className="progress-fill" style={{ width:`${(c.published/c.totalContent)*100}%`, background:c.color }} />
                    </div>
                    <span style={{ fontSize:"0.7rem", color:"var(--text-muted)", whiteSpace:"nowrap" }}>{c.published}/{c.totalContent} published</span>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", flexShrink:0 }}>
                  {[
                    { label:"Impressions", value:c.impressions>0?`${(c.impressions/1000).toFixed(0)}K`:"—", icon:Eye },
                    { label:"Engagement",  value:c.engagement>0?c.engagement.toLocaleString():"—",         icon:CheckCircle },
                    { label:"Clicks",      value:c.clicks>0?c.clicks.toLocaleString():"—",                 icon:Send },
                    { label:"Pending",     value:c.pending,                                                  icon:Clock },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"var(--font-space)", fontSize:"1rem", fontWeight:700, color:"var(--text-primary)" }}>{value}</div>
                      <div style={{ fontSize:"0.65rem", color:"var(--text-muted)" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", fontSize:"0.9375rem", marginBottom:"1rem" }}>Campaign Performance Comparison</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-muted)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-muted)", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Impressions" fill="#7c3aed" radius={[4,4,0,0]} />
              <Bar dataKey="Engagement"  fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="Clicks"      fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppShell>
  );
}
