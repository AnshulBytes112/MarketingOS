"use client";

import { contentCalendar, connectedPlatforms, approvalQueue } from "@/lib/mock-data";
import { Plus, CheckCircle, Link2, Wifi, WifiOff, Edit2, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

const tabs = ["Content Calendar", "Platform Connections", "Approval Queue"];

const platformColors: Record<string, string> = {
  Instagram: "#e1306c", LinkedIn: "#0a66c2", X: "#1d9bf0",
  YouTube: "#ff0000", TikTok: "#010101",
};
const platformIcons: Record<string, string> = {
  Instagram: "IG", LinkedIn: "LI", X: "X", YouTube: "YT", TikTok: "TK",
};

const calendarDays = Array.from({ length: 14 }, (_, i) => {
  const d = new Date("2026-08-08"); d.setDate(d.getDate() + i);
  return d.toISOString().split("T")[0];
});
const daysOfWeek = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function PublishingPage() {
  const [tab, setTab] = useState("Content Calendar");

  return (
    <AppShell>
      <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
        <div className="tab-list" style={{ width:"fit-content" }}>
          {tabs.map(t => <button key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "Content Calendar" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)" }}>August 2026</div>
              <button className="btn-primary" style={{ display:"flex", alignItems:"center", gap:"0.375rem", fontSize:"0.8rem" }}>
                <Plus size={13}/> Schedule Content
              </button>
            </div>

            <div className="card" style={{ padding:"1rem" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"0.5rem" }}>
                {daysOfWeek.map(d => (
                  <div key={d} style={{ textAlign:"center", fontSize:"0.7rem", color:"var(--text-muted)", fontWeight:600, padding:"0.375rem", letterSpacing:"0.05em" }}>{d}</div>
                ))}
                {Array.from({ length:5 }, (_,i) => <div key={`e${i}`} style={{ height:80 }} />)}
                {calendarDays.map(day => {
                  const dayContent = contentCalendar.filter(c => c.date === day);
                  const dayNum = new Date(day).getDate();
                  const isToday = day === "2026-08-08";
                  return (
                    <div key={day} style={{
                      minHeight:80, padding:"0.375rem", borderRadius:"0.5rem",
                      background: isToday ? "rgba(124,58,237,0.07)" : "var(--surface)",
                      border: `1px solid ${isToday?"rgba(124,58,237,0.25)":"var(--border-subtle)"}`,
                    }}>
                      <div style={{ fontSize:"0.7rem", fontWeight:isToday?700:500, color:isToday?"#7c3aed":"var(--text-muted)", marginBottom:"0.25rem" }}>{dayNum}</div>
                      {dayContent.map(c => (
                        <div key={c.id} style={{
                          padding:"0.2rem 0.375rem", borderRadius:"4px", marginBottom:"0.2rem",
                          background:`${platformColors[c.platform]||"#7c3aed"}15`,
                          fontSize:"0.6rem", color:"var(--text-soft)", lineHeight:1.3,
                          borderLeft:`2px solid ${platformColors[c.platform]||"#7c3aed"}`,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                        }}>
                          <span style={{ fontWeight:600, color:platformColors[c.platform] }}>{platformIcons[c.platform]}</span> {c.title.slice(0,18)}…
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", marginBottom:"0.875rem", fontSize:"0.9375rem" }}>Scheduled Content</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                {contentCalendar.map(c => (
                  <div key={c.id} className="glass-hover" style={{ padding:"0.75rem", borderRadius:"0.625rem", border:"1px solid var(--border)", background:"var(--surface)", display:"flex", alignItems:"center", gap:"0.75rem" }}>
                    <div style={{ width:32, height:32, borderRadius:"8px", background:`${platformColors[c.platform]||"#7c3aed"}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.6rem", fontWeight:700, color:platformColors[c.platform]||"#7c3aed", flexShrink:0 }}>
                      {platformIcons[c.platform]}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</div>
                      <div style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>{c.date} · {c.type} · {c.pillar}</div>
                    </div>
                    {c.score && <div style={{ fontSize:"0.75rem", fontWeight:700, color:"#7c3aed" }}>{c.score}</div>}
                    <span className={`badge badge-${c.status}`} style={{ fontSize:"0.7rem", flexShrink:0 }}>{c.status}</span>
                    <div style={{ display:"flex", gap:"0.25rem" }}>
                      <button className="btn-ghost" style={{ padding:"0.3rem", display:"flex", lineHeight:0 }}><Edit2 size={12}/></button>
                      <button className="btn-ghost" style={{ padding:"0.3rem", display:"flex", lineHeight:0 }}><X size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Platform Connections" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.875rem" }}>
            {connectedPlatforms.map((p, i) => (
              <div key={p.id} className="card glass-hover" style={{ animation:`fadeInUp ${0.3+i*0.06}s ease both` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.875rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
                    <div style={{ width:36, height:36, borderRadius:"8px", background:`${platformColors[p.platform]||"#64748b"}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", fontWeight:700, color:platformColors[p.platform]||"var(--text-muted)" }}>
                      {platformIcons[p.platform]}
                    </div>
                    <div>
                      <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)" }}>{p.platform}</div>
                      {p.account && <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{p.account}</div>}
                    </div>
                  </div>
                  <span className={`badge badge-${p.status}`}>
                    {p.status==="connected" ? <><Wifi size={10}/> Connected</> : p.status==="disconnected" ? <><WifiOff size={10}/> Disconnected</> : "Not Connected"}
                  </span>
                </div>
                {p.followers && (
                  <div style={{ display:"flex", gap:"1rem", marginBottom:"0.75rem" }}>
                    <div>
                      <div style={{ fontFamily:"var(--font-space)", fontSize:"1rem", fontWeight:700, color:"var(--text-primary)" }}>{p.followers.toLocaleString()}</div>
                      <div style={{ fontSize:"0.65rem", color:"var(--text-muted)" }}>Followers</div>
                    </div>
                    <div>
                      <div style={{ fontSize:"0.8rem", fontWeight:600, color:"#10b981" }}>{p.lastSync}</div>
                      <div style={{ fontSize:"0.65rem", color:"var(--text-muted)" }}>Last sync</div>
                    </div>
                  </div>
                )}
                {p.status==="connected"
                  ? <button className="btn-ghost" style={{ width:"100%", fontSize:"0.75rem", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}><RotateCcw size={12}/> Reconnect</button>
                  : <button className="btn-primary" style={{ width:"100%", fontSize:"0.75rem", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}><Link2 size={12}/> Connect Account</button>
                }
              </div>
            ))}
          </div>
        )}

        {tab === "Approval Queue" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {approvalQueue.map((item, i) => (
              <div key={item.id} className="card glass-hover" style={{ animation:`fadeInUp ${0.3+i*0.08}s ease both` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.875rem" }}>
                  <div>
                    <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", fontSize:"0.9375rem" }}>{item.title}</div>
                    <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:2 }}>{item.platform} · {item.type} · {item.scheduledFor}</div>
                  </div>
                  <span className="badge badge-review">Pending Review</span>
                </div>
                <p style={{ fontSize:"0.8125rem", color:"var(--text-secondary)", lineHeight:1.6, background:"rgba(124,58,237,0.06)", padding:"0.75rem", borderRadius:"0.5rem", borderLeft:"2px solid #7c3aed", margin:"0 0 1rem" }}>{item.preview}</p>
                <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1rem", flexWrap:"wrap" }}>
                  {Object.entries(item.scores).map(([k,v]) => (
                    <div key={k} style={{ padding:"0.3rem 0.625rem", background:"var(--surface-2)", borderRadius:"0.5rem", display:"flex", gap:"0.375rem", alignItems:"center" }}>
                      <span style={{ fontSize:"0.65rem", color:"var(--text-muted)" }}>{k.replace(/([A-Z])/g," $1").trim()}</span>
                      <span style={{ fontSize:"0.75rem", fontWeight:700, color:Number(v)>=90?"#10b981":Number(v)>=75?"#f59e0b":"#ef4444" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  <button className="btn-primary" style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.8rem" }}><CheckCircle size={13}/> Approve & Schedule</button>
                  <button className="btn-ghost" style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.8rem" }}><Edit2 size={13}/> Edit</button>
                  <button className="btn-ghost" style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.8rem" }}><RotateCcw size={13}/> Regenerate</button>
                  <button className="btn-ghost" style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.8rem", color:"#ef4444" }}><X size={13}/> Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
