"use client";

import { performanceData } from "@/lib/mock-data";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Award } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

const tabs = ["Overview","By Platform","Top Content","Insights"];

const platformPieData = performanceData.byPlatform.map((p,i) => ({
  name: p.platform, value: p.reach, color: ["#7c3aed","#2563eb","#10b981"][i],
}));

export default function AnalyticsPage() {
  const [tab, setTab] = useState("Overview");

  const T = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div style={{ background:"var(--bg-solid)", border:"1px solid var(--border)", borderRadius:"0.625rem", padding:"0.625rem 0.875rem", fontSize:"0.75rem" }}>
        <div style={{ color:"var(--text-muted)", marginBottom:4 }}>{label}</div>
        {payload.map((p: any) => <div key={p.name} style={{ color:p.color||p.fill, fontWeight:600 }}>{p.name}: {p.value?.toLocaleString()}</div>)}
      </div>
    );
    return null;
  };

  return (
    <AppShell>
      <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
        <div className="tab-list" style={{ width:"fit-content" }}>
          {tabs.map(t => <button key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "Overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"0.875rem" }}>
              {[
                { label:"Total Impressions", value:"248K", change:"+23.1%", up:true, color:"#7c3aed" },
                { label:"Total Reach",       value:"186K", change:"+18.4%", up:true, color:"#2563eb" },
                { label:"Engagements",       value:"13.4K",change:"+12.3%", up:true, color:"#10b981" },
                { label:"Link Clicks",       value:"6.5K", change:"+9.8%",  up:true, color:"#f59e0b" },
                { label:"Saves",             value:"2.2K", change:"+31.2%", up:true, color:"#8b5cf6" },
              ].map(({ label, value, change, up, color }, i) => (
                <div key={label} className="card glass-hover" style={{ animation:`fadeInUp ${0.3+i*0.05}s ease both` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color }} />
                    <div style={{ display:"flex", alignItems:"center", gap:2, fontSize:"0.7rem", color:up?"#10b981":"#ef4444" }}>
                      {up ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}{change}
                    </div>
                  </div>
                  <div style={{ fontFamily:"var(--font-space)", fontSize:"1.375rem", fontWeight:700, color:"var(--text-primary)" }}>{value}</div>
                  <div style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginTop:"0.2rem" }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:"1rem" }}>
              <div className="card">
                <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"1rem" }}>Impressions & Reach</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={performanceData.weekly}>
                    <defs>
                      <linearGradient id="ai" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25}/><stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient>
                      <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                    <XAxis dataKey="week" tick={{ fill:"var(--text-muted)", fontSize:11 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill:"var(--text-muted)", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1000}k`}/>
                    <Tooltip content={<T/>}/>
                    <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#7c3aed" fill="url(#ai)" strokeWidth={2} dot={false}/>
                    <Area type="monotone" dataKey="reach" name="Reach" stroke="#2563eb" fill="url(#ar)" strokeWidth={2} dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"0.5rem" }}>Reach by Platform</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={platformPieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={4}>
                      {platformPieData.map(p => <Cell key={p.name} fill={p.color}/>)}
                    </Pie>
                    <Tooltip formatter={(v:any)=>v.toLocaleString()} contentStyle={{ background:"var(--bg-solid)", border:"1px solid var(--border)", borderRadius:"0.5rem", color:"var(--text-primary)" }}/>
                  </PieChart>
                </ResponsiveContainer>
                {platformPieData.map(p => (
                  <div key={p.name} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.8rem", color:"var(--text-soft)" }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }}/>{p.name}
                    </div>
                    <span style={{ fontSize:"0.8rem", fontWeight:600, color:p.color }}>{p.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"1rem" }}>Engagement & Clicks</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={performanceData.weekly} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="week" tick={{ fill:"var(--text-muted)", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"var(--text-muted)", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<T/>}/>
                  <Bar dataKey="engagement" name="Engagement" fill="#10b981" radius={[4,4,0,0]}/>
                  <Bar dataKey="clicks"     name="Clicks"     fill="#f59e0b" radius={[4,4,0,0]}/>
                  <Bar dataKey="saves"      name="Saves"      fill="#8b5cf6" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "By Platform" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.875rem" }}>
            {performanceData.byPlatform.map((p,i) => (
              <div key={p.platform} className="card" style={{ animation:`fadeInUp ${0.3+i*0.08}s ease both` }}>
                <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"0.875rem" }}>{p.platform}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"0.875rem" }}>
                  {[["Posts",p.posts],["Avg Engagement",`${p.avgEngagement}%`],["Reach",p.reach.toLocaleString()],["Top Format",p.topFormat]].map(([k,v]) => (
                    <div key={String(k)} style={{ padding:"0.625rem", background:"var(--surface-2)", borderRadius:"0.5rem" }}>
                      <div style={{ fontSize:"0.65rem", color:"var(--text-muted)" }}>{k}</div>
                      <div style={{ fontSize:"0.9rem", fontWeight:700, color:"var(--text-primary)", marginTop:2 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="section-label" style={{ marginBottom:6 }}>Engagement Rate</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${p.avgEngagement*14}%`, background:["#7c3aed","#2563eb","#10b981"][i] }}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Top Content" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {performanceData.topContent.map((c,i) => (
              <div key={c.title} className="card glass-hover" style={{ animation:`fadeInUp ${0.3+i*0.06}s ease both` }}>
                <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
                  <div style={{ width:36, height:36, borderRadius:"8px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-space)", fontSize:"1rem", fontWeight:700, color:"#7c3aed", background:"rgba(124,58,237,0.1)" }}>#{i+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text-primary)" }}>{c.title}</div>
                    <div style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>{c.platform} · {c.type}</div>
                  </div>
                  <div style={{ display:"flex", gap:"1.5rem", textAlign:"right" }}>
                    {[["Engagement",`${c.engagement}%`],["Reach",c.reach.toLocaleString()],["Saves",c.saves.toLocaleString()]].map(([k,v]) => (
                      <div key={String(k)}>
                        <div style={{ fontFamily:"var(--font-space)", fontSize:"1rem", fontWeight:700, color:"var(--text-primary)" }}>{v}</div>
                        <div style={{ fontSize:"0.65rem", color:"var(--text-muted)" }}>{k}</div>
                      </div>
                    ))}
                  </div>
                  <Award size={16} color="#f59e0b"/>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Insights" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {performanceData.insights.map((ins,i) => (
              <div key={i} className="card" style={{ animation:`fadeInUp ${0.3+i*0.08}s ease both`, display:"flex", gap:"0.875rem", alignItems:"flex-start" }}>
                <div style={{ width:36, height:36, borderRadius:"8px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:ins.type==="win"?"rgba(16,185,129,0.1)":ins.type==="opportunity"?"rgba(124,58,237,0.1)":"rgba(245,158,11,0.1)" }}>
                  {ins.type==="win" ? <CheckCircle size={16} color="#10b981"/> : ins.type==="opportunity" ? <TrendingUp size={16} color="#7c3aed"/> : <AlertTriangle size={16} color="#f59e0b"/>}
                </div>
                <div>
                  <div className="section-label" style={{ marginBottom:4, color:ins.type==="win"?"#10b981":ins.type==="opportunity"?"#7c3aed":"#f59e0b" }}>
                    {ins.type==="win" ? "Win" : ins.type==="opportunity" ? "Opportunity" : "Warning"}
                  </div>
                  <p style={{ fontSize:"0.875rem", color:"var(--text-soft)", lineHeight:1.6, margin:0 }}>{ins.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
