"use client";

import { monthlyStrategy, brandDNA } from "@/lib/mock-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Lightbulb, Target, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";

const tabs = ["Monthly Strategy", "Funnel Map", "Content Pillars"];

export default function StrategyPage() {
  const [tab, setTab] = useState("Monthly Strategy");
  const { theme } = useTheme();

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-space)", fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{monthlyStrategy.month} Strategy</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>AI-generated strategy based on brand DNA, competitor intelligence, and market signals</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn-ghost" style={{ fontSize: "0.8rem" }}>Edit Strategy</button>
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem" }}><Zap size={13} /> Regenerate</button>
          </div>
        </div>

        <div className="tab-list" style={{ width: "fit-content" }}>
          {tabs.map(t => <button key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "Monthly Strategy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card" style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.08),rgba(37,99,235,0.06))", border:"1px solid rgba(124,58,237,0.2)", animation:"fadeInUp 0.3s ease both" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.5rem" }}>
                <Target size={16} color="#7c3aed" />
                <span className="section-label" style={{ color:"#7c3aed" }}>Primary Goal</span>
              </div>
              <div style={{ fontFamily:"var(--font-space)", fontSize:"1.125rem", fontWeight:700, color:"var(--text-primary)" }}>{monthlyStrategy.primaryGoal}</div>
              <div style={{ fontSize:"0.8rem", color:"var(--text-secondary)", marginTop:"0.25rem" }}>Target Segment: {monthlyStrategy.targetSegment}</div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.875rem" }}>
              {monthlyStrategy.kpiTargets.map(({ metric, target, current }) => (
                <div key={metric} className="card glass-hover" style={{ animation:"fadeInUp 0.35s ease both" }}>
                  <div className="section-label" style={{ marginBottom:"0.5rem" }}>{metric}</div>
                  <div style={{ fontFamily:"var(--font-space)", fontSize:"1.375rem", fontWeight:700, color:"#7c3aed" }}>{target}</div>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:"0.25rem" }}>Current: {current}</div>
                  <div style={{ marginTop:"0.5rem" }}><div className="progress-bar"><div className="progress-fill" style={{ width:"45%" }} /></div></div>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1rem" }}>
                <Lightbulb size={16} color="#f59e0b" />
                <span style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)" }}>AI Strategy Reasoning</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.625rem" }}>
                {[
                  "Instagram Reels are your highest-performing format (2.8× above average) — strategy prioritizes 40% Awareness content via short-form video.",
                  "Sustainability pillar generates 34% more saves — increase allocation to 20% with emphasis on stories that quantify impact.",
                  "LinkedIn articles posted Tuesday–Thursday 9-11am outperform other slots by 41% CTR — all scheduled accordingly.",
                  "Competitor BluePeak underserves 'Cold Brew Science' and 'Farm-to-Cup Stories' — both identified as high-opportunity topics.",
                ].map((reason, i) => (
                  <div key={i} style={{ display:"flex", gap:"0.625rem", padding:"0.625rem 0.75rem", background:"var(--surface-2)", borderRadius:"0.5rem" }}>
                    <CheckCircle size={14} color="#10b981" style={{ flexShrink:0, marginTop:1 }} />
                    <span style={{ fontSize:"0.8125rem", color:"var(--text-soft)", lineHeight:1.6 }}>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Funnel Map" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {monthlyStrategy.funnelMap.map(({ stage, percentage, content }, i) => (
              <div key={stage} className="card glass-hover" style={{ animation:`fadeInUp ${0.3+i*0.06}s ease both` }}>
                <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
                  <div style={{ width:60, height:60, borderRadius:"12px", flexShrink:0, background:`rgba(124,58,237,${0.06+i*0.02})`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontFamily:"var(--font-space)", fontSize:"1.125rem", fontWeight:700, color:"var(--text-primary)" }}>{percentage}%</div>
                    <div style={{ fontSize:"0.55rem", color:"var(--text-muted)" }}>allocation</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"0.375rem" }}>{stage}</div>
                    <div style={{ display:"flex", gap:"0.375rem", flexWrap:"wrap" }}>
                      {content.map(c => <span key={c} className="badge badge-draft" style={{ fontSize:"0.7rem" }}>{c}</span>)}
                    </div>
                  </div>
                  {i < monthlyStrategy.funnelMap.length-1 && <ArrowRight size={16} color="var(--text-muted)" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Content Pillars" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div className="card">
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"1rem" }}>Pillar Allocation</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={brandDNA.contentPillars} dataKey="weight" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                    {brandDNA.contentPillars.map(p => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                  <Tooltip formatter={(v:any) => `${v}%`} contentStyle={{ background:"var(--bg-solid)", border:"1px solid var(--border)", borderRadius:"0.625rem", color:"var(--text-primary)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginTop:"0.5rem" }}>
                {brandDNA.contentPillars.map(p => (
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }} key={p.name}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:p.color, flexShrink:0 }} />
                    <span style={{ fontSize:"0.8rem", color:"var(--text-soft)", flex:1 }}>{p.name}</span>
                    <span style={{ fontSize:"0.8rem", fontWeight:700, color:p.color }}>{p.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"1rem" }}>Pillar Performance Forecast</div>
              {brandDNA.contentPillars.map((p, i) => (
                <div key={p.name} style={{ marginBottom:"1rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:"0.8rem", color:"var(--text-soft)", fontWeight:500 }}>{p.name}</span>
                    <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>Projected Eng. {(3.2+i*0.4).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width:`${p.weight*2.5}%`, background:p.color }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
