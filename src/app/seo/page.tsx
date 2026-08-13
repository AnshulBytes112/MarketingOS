"use client";

import { seoData } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { FileText, Plus, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

const tabs = ["Keywords","Organic Traffic","Content Gaps"];

const diffColor = (d: number) => d < 30 ? "#10b981" : d < 50 ? "#f59e0b" : "#ef4444";
const positionIcon = (p: number | null) =>
  p === null ? <Minus size={12} color="var(--text-muted)"/> :
  p <= 10    ? <ArrowUp size={12} color="#10b981"/> :
  p <= 30    ? <ArrowUp size={12} color="#f59e0b"/> :
               <ArrowDown size={12} color="#ef4444"/>;

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload?.length) return (
    <div style={{ background:"var(--bg-solid)", border:"1px solid var(--border)", borderRadius:"0.625rem", padding:"0.625rem 0.875rem", fontSize:"0.75rem" }}>
      <div style={{ color:"var(--text-muted)", marginBottom:4 }}>{label}</div>
      {payload.map((p) => <div key={p.name} style={{ color:p.color||p.fill, fontWeight:600 }}>{p.name}: {p.value?.toLocaleString()}</div>)}
    </div>
  );
  return null;
};

export default function SEOPage() {
  const [tab, setTab] = useState("Keywords");
  const [sort, setSort] = useState("opportunity");



  const sorted = [...seoData.keywords].sort((a,b) => {
    if (sort==="opportunity") return a.opportunity>b.opportunity?-1:1;
    if (sort==="volume")      return b.volume-a.volume;
    return a.difficulty-b.difficulty;
  });

  return (
    <AppShell>
      <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.875rem" }}>
          {[
            { label:"Keywords Tracked", value:seoData.keywords.length, color:"#7c3aed" },
            { label:"Organic Traffic",  value:"4,340",                 color:"#2563eb" },
            { label:"Content Gaps",     value:seoData.contentGaps.length, color:"#10b981" },
            { label:"Avg Position",     value:"#18",                   color:"#f59e0b" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card glass-hover">
              <div style={{ fontFamily:"var(--font-space)", fontSize:"1.5rem", fontWeight:700, color }}>{value}</div>
              <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:"0.25rem" }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="tab-list" style={{ width:"fit-content" }}>
          {tabs.map(t => <button key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "Keywords" && (
          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)" }}>Keyword Research</div>
              <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
                <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>Sort by:</span>
                {["opportunity","volume","difficulty"].map(s => (
                  <button key={s} onClick={() => setSort(s)} style={{
                    padding:"0.25rem 0.625rem", borderRadius:"6px", fontSize:"0.75rem", fontWeight:500, cursor:"pointer", fontFamily:"var(--font-sans)", textTransform:"capitalize",
                    border:`1px solid ${sort===s?"#7c3aed":"var(--border)"}`,
                    background:sort===s?"rgba(124,58,237,0.12)":"var(--surface-2)",
                    color:sort===s?"#7c3aed":"var(--text-secondary)",
                  }}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {["Keyword","Search Volume","Difficulty","Position","Opportunity"].map(h => (
                      <th key={h} style={{ textAlign:"left", padding:"0.5rem 0.75rem", fontSize:"0.7rem", fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", borderBottom:"1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((kw) => (
                    <tr key={kw.keyword} className="glass-hover" style={{ borderBottom:"1px solid var(--border-subtle)", cursor:"pointer" }}>
                      <td style={{ padding:"0.75rem", fontSize:"0.8125rem", color:"var(--text-soft)", fontWeight:500 }}>{kw.keyword}</td>
                      <td style={{ padding:"0.75rem", fontSize:"0.8rem", color:"var(--text-secondary)" }}>{kw.volume.toLocaleString()}</td>
                      <td style={{ padding:"0.75rem" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div className="progress-bar" style={{ width:60 }}><div className="progress-fill" style={{ width:`${kw.difficulty}%`, background:diffColor(kw.difficulty) }}/></div>
                          <span style={{ fontSize:"0.75rem", fontWeight:600, color:diffColor(kw.difficulty) }}>{kw.difficulty}</span>
                        </div>
                      </td>
                      <td style={{ padding:"0.75rem" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                          {positionIcon(kw.position)}
                          <span style={{ fontSize:"0.8rem", color:kw.position!==null?"var(--text-soft)":"var(--text-muted)" }}>{kw.position!==null?`#${kw.position}`:"Not ranking"}</span>
                        </div>
                      </td>
                      <td style={{ padding:"0.75rem" }}><span className={`badge badge-${kw.opportunity.toLowerCase()}`}>{kw.opportunity}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "Organic Traffic" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div className="card">
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"1rem" }}>Monthly Organic Traffic</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={seoData.organicTraffic}>
                  <defs><linearGradient id="gt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25}/><stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="month" tick={{ fill:"var(--text-muted)", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"var(--text-muted)", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="traffic" name="Traffic" stroke="#7c3aed" fill="url(#gt)" strokeWidth={2} dot={{ fill:"#7c3aed", r:4 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"1rem" }}>Traffic by Keyword Cluster</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[{name:"Sustainability",traffic:1240},{name:"Origin Stories",traffic:980},{name:"Brew Guides",traffic:860},{name:"Specialty",traffic:720},{name:"Comparisons",traffic:540}]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="name" tick={{ fill:"var(--text-muted)", fontSize:10 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"var(--text-muted)", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="traffic" name="Traffic" fill="#2563eb" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "Content Gaps" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {seoData.contentGaps.map((gap,i) => (
              <div key={gap.topic} className="card glass-hover" style={{ animation:`fadeInUp ${0.3+i*0.06}s ease both` }}>
                <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
                  <div style={{ width:40, height:40, borderRadius:"8px", background:"rgba(124,58,237,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <FileText size={16} color="#7c3aed"/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text-primary)" }}>{gap.topic}</div>
                    <div style={{ display:"flex", gap:"1rem", marginTop:2 }}>
                      <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>Volume: <span style={{ color:"var(--text-soft)" }}>{gap.volume.toLocaleString()}/mo</span></span>
                      <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>Difficulty: <span style={{ color:diffColor(gap.difficulty) }}>{gap.difficulty}</span></span>
                      <span className={`badge ${gap.status === "Draft" ? "badge-review" : "badge-draft"}`} style={{ fontSize:"0.65rem" }}>{gap.status}</span>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.8rem", flexShrink:0 }}>
                    <Plus size={13}/> Create Article
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
