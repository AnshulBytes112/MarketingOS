"use client";

import Image from "next/image";
import { brandDNA } from "@/lib/mock-data";
import { Brain, Upload, Globe, Target, Users, Sparkles, Shield, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

const tabs = ["Brand DNA", "Voice & Tone", "Audience", "Assets", "Guidelines"];

export default function BrandPage() {
  const [activeTab, setActiveTab] = useState("Brand DNA");

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "white" }}>NB</div>
            <div>
              <h2 style={{ fontFamily: "var(--font-space)", fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{brandDNA.name}</h2>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{brandDNA.industry} · {brandDNA.geography} · {brandDNA.priceSegment}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem" }}><Upload size={13} /> Upload Asset</button>
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem" }}><Sparkles size={13} /> Regenerate DNA</button>
          </div>
        </div>

        <div className="tab-list" style={{ width: "fit-content" }}>
          {tabs.map(t => <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>)}
        </div>

        {activeTab === "Brand DNA" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="card" style={{ animation: "fadeInUp 0.3s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Brain size={16} color="#7c3aed" />
                <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)" }}>Core Identity</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[["Industry",brandDNA.industry],["Geography",brandDNA.geography],["Price Segment",brandDNA.priceSegment],["Website",brandDNA.website],["Founded",brandDNA.founded]].map(([k,v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.625rem", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{k}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-soft)", fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ animation: "fadeInUp 0.32s ease both", padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ImageIcon size={16} color="#7c3aed" />
                  <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)" }}>Hero Product Asset</span>
                </div>
                <span className="badge badge-approved">Active Pack</span>
              </div>
              <div style={{ borderRadius: "0.625rem", overflow: "hidden", border: "1px solid var(--border)" }}>
                <Image src="/images/product_package.png" alt="NovaBrew Packaging" width={500} height={300} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                NovaBrew Ethiopian Yirgacheffe Single-Origin Packaging Mockup
              </div>
            </div>

            <div className="card" style={{ animation: "fadeInUp 0.35s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Target size={16} color="#2563eb" />
                <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)" }}>Positioning & USP</span>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <div className="section-label" style={{ marginBottom: "0.375rem" }}>Positioning Statement</div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-soft)", lineHeight: 1.6, background: "rgba(37,99,235,0.07)", padding: "0.625rem", borderRadius: "0.5rem", borderLeft: "2px solid #2563eb", margin: 0 }}>{brandDNA.positioning}</p>
              </div>
              <div>
                <div className="section-label" style={{ marginBottom: "0.375rem" }}>Unique Value Proposition</div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-soft)", lineHeight: 1.6, background: "rgba(124,58,237,0.07)", padding: "0.625rem", borderRadius: "0.5rem", borderLeft: "2px solid #7c3aed", margin: 0 }}>{brandDNA.usp}</p>
              </div>
            </div>

            <div className="card" style={{ animation: "fadeInUp 0.4s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Globe size={16} color="#10b981" />
                <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)" }}>Content Pillars</span>
              </div>
              {brandDNA.contentPillars.map(p => (
                <div key={p.name} style={{ marginBottom: "0.875rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-soft)", fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: p.color }}>{p.weight}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${p.weight}%`, background: p.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ animation: "fadeInUp 0.45s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Shield size={16} color="#ef4444" />
                <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)" }}>Brand Guidelines & Avoid List</span>
              </div>
              <div className="section-label" style={{ marginBottom: "0.5rem" }}>DO NOT USE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {brandDNA.avoid.map(a => (
                  <div key={a} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#ef4444", padding: "0.375rem 0.625rem", background: "rgba(239,68,68,0.07)", borderRadius: "0.375rem" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />{a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Voice & Tone" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="card">
              <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>Brand Personality</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {brandDNA.personality.map(t => (
                  <div key={t} style={{ padding: "0.5rem 1rem", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "99px", fontSize: "0.8rem", color: "#7c3aed", fontWeight: 500 }}>{t}</div>
                ))}
              </div>
              <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem", marginTop: "1.5rem" }}>Tone Attributes</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {brandDNA.tone.map(t => (
                  <div key={t} style={{ padding: "0.5rem 1rem", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: "99px", fontSize: "0.8rem", color: "#2563eb", fontWeight: 500 }}>{t}</div>
                ))}
              </div>
            </div>
            <div className="card">
              <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>Sample Brand Voice</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { label: "Caption Style", sample: "Every cup begins with a choice. NovaBrew Yirgacheffe — single-origin, carefully sourced, thoughtfully roasted." },
                  { label: "LinkedIn Post", sample: "Specialty coffee isn't a luxury. It's a direct payment to the farmers who invested years perfecting their craft." },
                  { label: "CTA Style", sample: "Explore the origin →" },
                ].map(({ label, sample }) => (
                  <div key={label}>
                    <div className="section-label" style={{ marginBottom: "0.375rem" }}>{label}</div>
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-soft)", lineHeight: 1.6, padding: "0.625rem", background: "rgba(124,58,237,0.06)", borderRadius: "0.5rem", borderLeft: "2px solid #7c3aed", margin: 0 }}>{sample}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Audience" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Users size={16} color="#7c3aed" />
                <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)" }}>Target Audience</span>
              </div>
              {[["Primary", brandDNA.audience.primary], ["Secondary", brandDNA.audience.secondary]].map(([k, v]) => (
                <div key={k} style={{ marginBottom: "0.875rem" }}>
                  <div className="section-label" style={{ marginBottom: "0.375rem" }}>{k} Audience</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-soft)", padding: "0.625rem", background: "rgba(124,58,237,0.07)", borderRadius: "0.5rem" }}>{v}</div>
                </div>
              ))}
              <div className="section-label" style={{ marginBottom: "0.5rem", marginTop: "0.5rem" }}>Psychographics</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {brandDNA.audience.psychographics.map(p => <span key={p} className="badge badge-active">{p}</span>)}
              </div>
            </div>
            <div className="card">
              <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>Audience Demographics</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[["Age 25–34", 48, "#7c3aed"], ["Age 35–44", 32, "#2563eb"], ["Age 18–24", 12, "#10b981"], ["Age 45+", 8, "#f59e0b"]].map(([l, p, c]) => (
                  <div key={String(l)}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>{l}</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: String(c) }}>{p}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${p}%`, background: String(c) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Assets" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="card">
              <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>Brand Visual Assets</div>
              <div style={{ borderRadius: "0.5rem", overflow: "hidden", border: "1px solid var(--border)", marginBottom: "0.75rem" }}>
                <Image src="/images/product_package.png" alt="NovaBrew Packaging Asset" width={500} height={300} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
              </div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>NovaBrew_Pack_Mockup_2026.png</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>High-res 3D render · 3400x3400px · Matte Finish</div>
            </div>

            <div className="card">
              <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>Campaign Visual Assets</div>
              <div style={{ borderRadius: "0.5rem", overflow: "hidden", border: "1px solid var(--border)", marginBottom: "0.75rem" }}>
                <Image src="/images/cold_brew.png" alt="Cold Brew Asset" width={500} height={300} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
              </div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>ColdBrew_Reel_Creative_01.png</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>Social Media Creative · 1080x1920px · Cold Brew Series</div>
            </div>
          </div>
        )}

        {activeTab === "Guidelines" && (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <Upload size={32} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
            <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-soft)", fontSize: "1rem" }}>Upload Brand Assets & Guidelines</div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>Drop logos, brand decks, presentations, and style guides here</p>
            <button className="btn-primary" style={{ marginTop: "1rem" }}><Upload size={13} style={{ display: "inline", marginRight: 6 }} /> Choose Files</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
