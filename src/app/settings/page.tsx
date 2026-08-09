"use client";

import { Users, Shield, Building, CreditCard, Plus, Check, Key } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

const tabs = ["Organization","Team & Roles","Integrations","Billing","Notifications"];

const roles = [
  { name:"Owner",             desc:"Full access, billing, and org settings", count:1 },
  { name:"Admin",             desc:"All features except billing",             count:1 },
  { name:"Marketing Manager", desc:"Strategy, campaigns, approvals, publishing", count:2 },
  { name:"Content Manager",   desc:"Content creation, calendar, drafts",     count:3 },
  { name:"Analyst",           desc:"Analytics and reporting — read only",     count:1 },
  { name:"Approver",          desc:"Review and approve/reject content queue", count:2 },
];

const members = [
  { name:"John Doe",    email:"john@novabrew.com",   role:"Owner",            avatar:"JD", status:"active" },
  { name:"Sarah Kim",   email:"sarah@novabrew.com",  role:"Marketing Manager",avatar:"SK", status:"active" },
  { name:"Marcus Lee",  email:"marcus@novabrew.com", role:"Content Manager",  avatar:"ML", status:"active" },
  { name:"Priya Sharma",email:"priya@novabrew.com",  role:"Analyst",          avatar:"PS", status:"active" },
  { name:"Tom Baker",   email:"tom@novabrew.com",    role:"Approver",         avatar:"TB", status:"pending" },
];

const integrations = [
  { name:"OpenAI GPT-4o",    category:"LLM",      status:"connected",    desc:"Primary model for content generation and strategy" },
  { name:"Anthropic Claude",  category:"LLM",      status:"connected",    desc:"Reasoning and analysis tasks" },
  { name:"Stability AI",      category:"Image",    status:"connected",    desc:"AI image generation for social creatives" },
  { name:"Semrush API",       category:"SEO",      status:"connected",    desc:"Keyword research and ranking data" },
  { name:"Meta Business API", category:"Social",   status:"connected",    desc:"Instagram and Facebook publishing" },
  { name:"LinkedIn API",      category:"Social",   status:"connected",    desc:"LinkedIn page management and publishing" },
  { name:"X API v2",          category:"Social",   status:"connected",    desc:"X posting and analytics" },
  { name:"YouTube Data API",  category:"Social",   status:"disconnected", desc:"YouTube channel management" },
  { name:"Pinecone",          category:"Vector DB",status:"connected",    desc:"Brand knowledge and content embeddings" },
  { name:"Stripe",            category:"Billing",  status:"connected",    desc:"Subscription and usage billing" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("Organization");

  return (
    <AppShell>
      <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
        <div className="tab-list" style={{ width:"fit-content" }}>
          {tabs.map(t => <button key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "Organization" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div className="card">
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1.25rem" }}>
                <Building size={15} color="#7c3aed"/>
                <span style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)" }}>Organization Details</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                {[
                  ["Organization Name","NovaBrew Coffee"],
                  ["Industry","Food & Beverage"],
                  ["Plan","Growth (5 brands, 10 users)"],
                  ["Billing Cycle","Monthly"],
                  ["Data Region","United States (us-east-1)"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="section-label" style={{ marginBottom:4 }}>{label}</div>
                    <input className="input" defaultValue={value}/>
                  </div>
                ))}
                <button className="btn-primary" style={{ marginTop:"0.5rem" }}>Save Changes</button>
              </div>
            </div>
            <div className="card">
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1.25rem" }}>
                <Shield size={15} color="#10b981"/>
                <span style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)" }}>Security & Access</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                {[
                  ["Two-Factor Authentication","Enabled","#10b981"],
                  ["SSO / SAML","Not configured","var(--text-muted)"],
                  ["IP Allowlist","Disabled","var(--text-muted)"],
                  ["Session Timeout","8 hours","var(--text-secondary)"],
                  ["API Keys","3 active keys","#7c3aed"],
                ].map(([label,value,color]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.625rem", background:"var(--surface-2)", borderRadius:"0.5rem" }}>
                    <span style={{ fontSize:"0.8rem", color:"var(--text-secondary)" }}>{label}</span>
                    <span style={{ fontSize:"0.8rem", fontWeight:600, color:String(color) }}>{value}</span>
                  </div>
                ))}
                <button className="btn-ghost" style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.8rem" }}>
                  <Key size={13}/> Manage API Keys
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "Team & Roles" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div className="card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
                <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)" }}>Team Members</div>
                <button className="btn-primary" style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.8rem" }}>
                  <Plus size={13}/> Invite Member
                </button>
              </div>
              {members.map((m,i) => (
                <div key={m.email} className="glass-hover" style={{ display:"flex", alignItems:"center", gap:"0.875rem", padding:"0.625rem 0.75rem", borderRadius:"0.625rem", borderBottom:i<members.length-1?"1px solid var(--border-subtle)":"none" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:700, color:"white", flexShrink:0 }}>{m.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--text-primary)" }}>{m.name}</div>
                    <div style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>{m.email}</div>
                  </div>
                  <span className="badge badge-active" style={{ fontSize:"0.7rem" }}>{m.role}</span>
                  <span className={`badge badge-${m.status === "active" ? "approved" : "review"}`} style={{ fontSize:"0.65rem" }}>{m.status}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"1rem" }}>Role Definitions</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.625rem" }}>
                {roles.map(r => (
                  <div key={r.name} style={{ padding:"0.75rem", background:"var(--surface-2)", borderRadius:"0.625rem", border:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--text-soft)" }}>{r.name}</span>
                      <span style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>{r.count} user{r.count!==1?"s":""}</span>
                    </div>
                    <p style={{ fontSize:"0.75rem", color:"var(--text-muted)", lineHeight:1.5, margin:0 }}>{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Integrations" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.875rem" }}>
            {integrations.map((int,i) => (
              <div key={int.name} className="card glass-hover" style={{ animation:`fadeInUp ${0.3+i*0.04}s ease both` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:2 }}>
                      <div style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--text-primary)" }}>{int.name}</div>
                      <span className="badge badge-draft" style={{ fontSize:"0.6rem" }}>{int.category}</span>
                    </div>
                    <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{int.desc}</div>
                  </div>
                  <span className={`badge badge-${int.status}`} style={{ flexShrink:0, marginLeft:"0.5rem" }}>
                    {int.status==="connected" ? <><Check size={10}/> Connected</> : "Disconnected"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Billing" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div className="card">
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1.25rem" }}>
                <CreditCard size={15} color="#7c3aed"/>
                <span style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)" }}>Current Plan</span>
              </div>
              <div style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.07))", border:"1px solid rgba(124,58,237,0.2)", borderRadius:"0.875rem", padding:"1.25rem", marginBottom:"1rem" }}>
                <div className="section-label" style={{ marginBottom:4 }}>Growth Plan</div>
                <div style={{ fontFamily:"var(--font-space)", fontSize:"2rem", fontWeight:700, color:"var(--text-primary)" }}>$299<span style={{ fontSize:"1rem", color:"var(--text-muted)" }}>/mo</span></div>
                <div style={{ fontSize:"0.75rem", color:"#7c3aed", marginTop:4 }}>5 brands · 10 users · Unlimited content</div>
              </div>
              {[["Content Generated","1,240 / Unlimited"],["AI API Usage (est.)","$42.80 this month"],["Active Users","5 / 10"],["Connected Platforms","3 / 6"]].map(([k,v]) => (
                <div key={String(k)} style={{ display:"flex", justifyContent:"space-between", padding:"0.5rem 0", borderBottom:"1px solid var(--border-subtle)", fontSize:"0.8rem" }}>
                  <span style={{ color:"var(--text-muted)" }}>{k}</span>
                  <span style={{ color:"var(--text-soft)", fontWeight:500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"1rem" }}>Usage This Month</div>
              {[
                { label:"LLM Tokens",       used:68, color:"#7c3aed" },
                { label:"Image Generations",used:42, color:"#2563eb" },
                { label:"SEO API Calls",    used:31, color:"#10b981" },
                { label:"Publishing API",   used:88, color:"#f59e0b" },
              ].map(({ label, used, color }) => (
                <div key={label} style={{ marginBottom:"1rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:"0.8rem", color:"var(--text-soft)" }}>{label}</span>
                    <span style={{ fontSize:"0.8rem", fontWeight:600, color }}>{used}% used</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width:`${used}%`, background:color }}/></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Notifications" && (
          <div className="card">
            <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"1.25rem" }}>Notification Preferences</div>
            {[
              { label:"Content ready for approval",  desc:"When AI generates content requiring review",      enabled:true },
              { label:"Content published",            desc:"When scheduled content goes live",                enabled:true },
              { label:"Engagement anomaly",           desc:"When engagement spikes or drops significantly",   enabled:true },
              { label:"Competitor activity alert",    desc:"When a tracked competitor posts high-performing content", enabled:false },
              { label:"Weekly performance digest",    desc:"Sunday summary of the week's key metrics",        enabled:true },
              { label:"AI strategy update",           desc:"When the AI generates a new monthly strategy",    enabled:true },
              { label:"SEO position changes",         desc:"When keyword positions move significantly",       enabled:false },
              { label:"Platform API issues",          desc:"When a social platform connection fails",         enabled:true },
            ].map(({ label, desc, enabled }, i, arr) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1rem 0", borderBottom:i<arr.length-1?"1px solid var(--border-subtle)":"none" }}>
                <div>
                  <div style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text-soft)" }}>{label}</div>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:2 }}>{desc}</div>
                </div>
                <div style={{ width:44, height:24, borderRadius:99, cursor:"pointer", background:enabled?"linear-gradient(135deg,#7c3aed,#2563eb)":"var(--surface-3)", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                  <div style={{ position:"absolute", top:3, left:enabled?23:3, width:18, height:18, borderRadius:"50%", background:"white", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
