"use client";

import { trendingTopics } from "@/lib/mock-data";
import { TrendingUp, Flame, Hash, Lightbulb, ExternalLink, Zap } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

const platforms = ["All","Instagram","X","TikTok","YouTube","LinkedIn"];
const types     = ["All","Trend","Hashtag","Content","Industry"];

export default function MarketPage() {
  const [platform, setPlatform] = useState("All");
  const [type, setType]         = useState("All");

  const filtered = trendingTopics.filter(t =>
    (platform === "All" || t.platform === platform) &&
    (type     === "All" || t.type     === type)
  );

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.875rem" }}>
          {[
            { label: "Trends Detected", value: "247", icon: TrendingUp, color: "#7c3aed" },
            { label: "Brand Mentions",  value: "1,284", icon: Hash,       color: "#2563eb" },
            { label: "Opportunities",   value: "38",  icon: Lightbulb,  color: "#10b981" },
            { label: "Viral Discussions",value: "12", icon: Flame,      color: "#ef4444" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card glass-hover" style={{ animation: "fadeInUp 0.3s ease both" }}>
              <div style={{ width: 36, height: 36, borderRadius: "8px", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                <Icon size={16} color={color} />
              </div>
              <div style={{ fontFamily: "var(--font-space)", fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
          <div>
            <div className="section-label" style={{ marginBottom: 4 }}>Platform</div>
            <div className="tab-list">
              {platforms.map(p => <button key={p} className={`tab ${platform===p?"active":""}`} onClick={() => setPlatform(p)}>{p}</button>)}
            </div>
          </div>
          <div>
            <div className="section-label" style={{ marginBottom: 4 }}>Type</div>
            <div className="tab-list">
              {types.map(t => <button key={t} className={`tab ${type===t?"active":""}`} onClick={() => setType(t)}>{t}</button>)}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem" }}>
          {filtered.map((topic, i) => (
            <div key={topic.topic} className="card glass-hover" style={{ animation: `fadeInUp ${0.3+i*0.05}s ease both` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <span className="badge badge-active" style={{ fontSize: "0.65rem" }}>{topic.platform}</span>
                  <span className="badge badge-draft"  style={{ fontSize: "0.65rem" }}>{topic.type}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", color: "#10b981", fontWeight: 600 }}>
                  <TrendingUp size={11} />+{topic.growth}%
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-space)", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.375rem", lineHeight: 1.3 }}>{topic.topic}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.875rem" }}>{(topic.volume/1000).toFixed(0)}K mentions · {topic.relevance}% relevance</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Brand Relevance</span>
                <span style={{ fontSize: "0.65rem", fontWeight: 600, color: topic.relevance>80?"#10b981":topic.relevance>60?"#f59e0b":"var(--text-muted)" }}>{topic.relevance}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${topic.relevance}%`, background: topic.relevance>80?"#10b981":"#f59e0b" }} />
              </div>
              <div style={{ marginTop: "0.875rem", display: "flex", gap: "0.5rem" }}>
                <button className="btn-primary" style={{ flex:1, padding:"0.375rem", fontSize:"0.75rem", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                  <Zap size={11} /> Generate Content
                </button>
                <button className="btn-ghost" style={{ padding:"0.375rem 0.625rem", display:"flex", alignItems:"center" }}>
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.07),rgba(37,99,235,0.05))", border:"1px solid rgba(124,58,237,0.18)", animation:"fadeInUp 0.6s ease both" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.875rem" }}>
            <Zap size={15} color="#7c3aed" />
            <span style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)" }}>AI Weekly Opportunity Brief</span>
            <span className="badge badge-active" style={{ marginLeft:"auto" }}>Aug 7, 2026</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.875rem" }}>
            {[
              { title:"High-ROI Trend",      body:`"AI & Coffee Roasting" is surging +89% on LinkedIn with 95% relevance to your brand. Window for thought leadership before competitors discover it.`, cta:"Create Article" },
              { title:"Viral Opportunity",    body:`"Coffee Ceremony Culture" is at 5.6M TikTok views. Create a 60-second reel explaining the Ethiopian ceremony — aligns with your origin story.`, cta:"Script Reel" },
              { title:"Hashtag Gap",          body:`#SustainableCoffee is growing 21% on X but only 3 of your recent posts used it. Increase hashtag coverage for your sustainability pillar.`, cta:"Optimize Posts" },
            ].map(({ title, body, cta }) => (
              <div key={title} style={{ padding:"0.875rem", background:"var(--surface-2)", borderRadius:"0.75rem" }}>
                <div style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--text-primary)", marginBottom:"0.5rem" }}>{title}</div>
                <p style={{ fontSize:"0.75rem", color:"var(--text-secondary)", lineHeight:1.6, marginBottom:"0.75rem" }}>{body}</p>
                <button className="btn-primary" style={{ width:"100%", padding:"0.375rem", fontSize:"0.75rem" }}>{cta}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
