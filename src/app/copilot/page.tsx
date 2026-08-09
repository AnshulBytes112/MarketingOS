"use client";

import { copilotHistory } from "@/lib/mock-data";
import { Send, Zap, RefreshCw, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";

const suggestions = [
  "Why did LinkedIn engagement drop last week?",
  "What should we post tomorrow?",
  "Generate a 30-day campaign for August",
  "What's our best performing content format?",
  "Summarize competitor content gaps",
  "Which hashtags are driving the most saves?",
];

const replies: Record<string, string> = {
  "Why did LinkedIn engagement drop last week?": `**Observation:** LinkedIn engagement dropped 18% week-over-week (from 4.2% to 3.4% avg engagement rate).\n\n**Likely Cause:** Your 3 posts last week were all published on Friday afternoon — LinkedIn's lowest-engagement window. Additionally, all 3 were image-only posts; your audience responds 2.3× better to articles and carousels.\n\n**Recommendation:** Shift LinkedIn publishing to Tuesday–Thursday, 8–10am. Prioritize articles and document carousels. Schedule at least 1 article per week.`,
  "What should we post tomorrow?": `**Recommendation for tomorrow (Aug 8, 2026):**\n\n**Instagram Reel (6:00–8:00 PM)**\nTopic: "The 90-Second Cold Brew Method" — aligns with top-performing Awareness content and capitalizes on the trending "Cold Brew Science" competitor gap.\n\n**LinkedIn Article (9:00–10:00 AM)**\nTopic: "Why We Pay 2.8× the Commodity Rate" — Sustainability pillar generates 34% more saves than average. Skip Saturday LinkedIn; post Monday morning instead.`,
  "What's our best performing content format?": `**Performance by Format (Last 30 Days):**\n\nInstagram Reels: **8.1% engagement** · 11,200 reach · 620 saves\nLinkedIn Articles: 6.4% · 8,400 reach · 290 saves\nInstagram Carousels: 5.9% · 7,800 reach · 540 saves\nX Threads: 3.2% · 4,100 reach\nInstagram Static: 2.8% · 5,200 reach\n\n**Key insight:** Reels outperform static posts by **2.9×** on engagement. Carousels drive disproportionately high saves — ideal for educational content.\n\n**Recommendation:** Increase Reel production to 3×/week on Instagram.`,
};

export default function CopilotPage() {
  const [messages, setMessages] = useState(copilotHistory);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const send = (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim()) return;
    setMessages(m => [...m, { role:"user", content:msg }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const reply = replies[msg] ?? `I've analyzed your NovaBrew data for "${msg}".\n\n**Observation:** Based on the last 30 days of performance data across Instagram, LinkedIn, and X...\n\n**Recommendation:** Focusing on Reels and LinkedIn articles will yield the highest compound return given your current audience growth trajectory. Your Sustainability pillar consistently outperforms other pillars by 34% in saves — lean into it aggressively this month.`;
      setMessages(m => [...m, { role:"assistant", content:reply }]);
      setLoading(false);
    }, 1800);
  };

  const fmt = (text: string) =>
    text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**") && line.length > 4)
        return <div key={i} style={{ fontWeight:700, color:"var(--text-primary)", marginBottom:4, marginTop:i>0?8:0 }}>{line.replace(/\*\*/g,"")}</div>;
      if (line.trim()==="") return <div key={i} style={{ height:8 }}/>;
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      return <div key={i} style={{ marginBottom:3, color:"var(--text-soft)" }}>{parts.map((p,j)=>j%2===1?<strong key={j} style={{ color:"var(--text-primary)" }}>{p}</strong>:p)}</div>;
    });

  return (
    <AppShell>
      <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)", gap:"1rem" }}>
        {/* Header */}
        <div className="card" style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.08),rgba(37,99,235,0.06))", border:"1px solid rgba(124,58,237,0.18)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <div style={{ width:40, height:40, borderRadius:"10px", background:"linear-gradient(135deg,#7c3aed,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 20px rgba(124,58,237,0.3)" }}>
              <Zap size={18} color="white"/>
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)" }}>AI Marketing Copilot</div>
              <div style={{ fontSize:"0.75rem", color:"var(--text-secondary)" }}>Ask anything about your brand performance, strategy, or content</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"0.375rem", fontSize:"0.7rem", color:"#10b981", fontWeight:600 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 6px #10b981" }}/>
              Analyzing NovaBrew data
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="card" style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"1rem", padding:"1.25rem" }}>
          {messages.map((msg,i) => (
            <div key={i} style={{ display:"flex", gap:"0.75rem", justifyContent:msg.role==="user"?"flex-end":"flex-start" }}>
              {msg.role==="assistant" && (
                <div style={{ width:32, height:32, borderRadius:"8px", background:"linear-gradient(135deg,#7c3aed,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Zap size={14} color="white"/>
                </div>
              )}
              <div style={{
                maxWidth:"80%", padding:"0.75rem 1rem", lineHeight:1.65, fontSize:"0.8125rem",
                borderRadius:msg.role==="user"?"16px 16px 4px 16px":"4px 16px 16px 16px",
                background:msg.role==="user"?"linear-gradient(135deg,rgba(124,58,237,0.18),rgba(37,99,235,0.15))":"var(--surface-2)",
                border:`1px solid ${msg.role==="user"?"rgba(124,58,237,0.25)":"var(--border)"}`,
                animation:"fadeInUp 0.25s ease both",
              }}>
                {msg.role==="assistant" ? fmt(msg.content) : <span style={{ color:"var(--text-soft)" }}>{msg.content}</span>}
              </div>
              {msg.role==="user" && (
                <div style={{ width:32, height:32, borderRadius:"8px", background:"var(--surface-3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"0.75rem", fontWeight:700, color:"var(--text-primary)" }}>JD</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", gap:"0.75rem" }}>
              <div style={{ width:32, height:32, borderRadius:"8px", background:"linear-gradient(135deg,#7c3aed,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Zap size={14} color="white"/>
              </div>
              <div style={{ padding:"0.875rem 1rem", borderRadius:"4px 16px 16px 16px", background:"var(--surface-2)", border:"1px solid var(--border)", display:"flex", gap:"0.375rem", alignItems:"center" }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#7c3aed", animation:`float ${0.8+i*0.2}s ease-in-out infinite` }}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Suggestions */}
        <div style={{ display:"flex", gap:"0.375rem", flexWrap:"wrap", flexShrink:0 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} className="btn-ghost" style={{ fontSize:"0.75rem", padding:"0.35rem 0.75rem", display:"flex", alignItems:"center", gap:4 }}>
              <Sparkles size={11} color="#7c3aed"/>{s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="card" style={{ flexShrink:0, display:"flex", gap:"0.75rem", alignItems:"center", padding:"0.75rem 1rem" }}>
          <input className="input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about your brand performance, strategy, content…" style={{ border:"none", background:"transparent", boxShadow:"none" }}/>
          <button className="btn-primary" onClick={()=>send()} disabled={!input.trim()||loading} style={{ flexShrink:0, display:"flex", alignItems:"center", gap:4 }}>
            {loading ? <RefreshCw size={14} className="animate-spin-slow"/> : <Send size={14}/>} Send
          </button>
        </div>
      </div>
    </AppShell>
  );
}
