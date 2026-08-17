/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Zap, ArrowRight, Sparkles, Brain, Users, TrendingUp,
  Lightbulb, Megaphone, Send, BarChart3, Search, MessageSquare,
  ChevronDown, Play, Check, Globe, LogIn
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const engines = [
  { icon: Brain, title: "Brand Intelligence", desc: "Automated Brand DNA extraction, voice modeling, and guideline enforcement across all touchpoints.", color: "#7c3aed" },
  { icon: Users, title: "Competitor Intel", desc: "Real-time benchmarking, content mix breakdown, and automated opportunity surfacing.", color: "#2563eb" },
  { icon: TrendingUp, title: "Market Intelligence", desc: "Social listening, trend prediction, and viral topic detection tailored to your niche.", color: "#10b981" },
  { icon: Lightbulb, title: "Strategy Engine", desc: "AI-generated monthly campaigns, funnel mapping, and goal-driven pillar allocation.", color: "#f59e0b" },
  { icon: Sparkles, title: "Content Engine", desc: "Multi-format content generation with 5-dimension quality scoring and instant previews.", color: "#8b5cf6" },
  { icon: Megaphone, title: "Campaign Engine", desc: "End-to-end campaign tracking, budget management, and multi-channel performance.", color: "#ec4899" },
  { icon: Send, title: "Publishing Engine", desc: "14-day automated content calendar with multi-platform queue management.", color: "#3b82f6" },
  { icon: BarChart3, title: "Analytics Engine", desc: "Deep post-level reach, engagement, save rates, and AI-powered performance insights.", color: "#10b981" },
  { icon: Search, title: "SEO Engine", desc: "Keyword opportunity scoring, search volume tracking, and content gap planner.", color: "#f59e0b" },
  { icon: MessageSquare, title: "AI Marketing Copilot", desc: "Natural language assistant connected directly to your brand's real-time analytics data.", color: "#7c3aed" },
];

const faqs = [
  { q: "How does the AI Brand Growth Engine extract my Brand DNA?", a: "Our AI analyzes your existing website, social channels, uploaded brand decks, and sample copy to build a comprehensive Brand DNA model including tone sliders, content pillars, and prohibited messaging rules." },
  { q: "Can I connect my active social media accounts?", a: "Yes! The Publishing Engine integrates natively with Meta (Instagram/Facebook), LinkedIn, X (Twitter), YouTube, and TikTok for direct scheduling and analytics retrieval." },
  { q: "How does the 5-dimension content scoring work?", a: "Every generated post is scored on Brand Fit, SEO Optimization, Originality, Factuality, and Call-to-Action strength before being sent to your human approval queue." },
  { q: "Is light and dark mode supported?", a: "Full theme support is built in with smooth transitions, persistent preferences, and dark glassmorphism or sleek light mode styling." }
];

export default function StandaloneLandingPage() {
  const { theme, toggle } = useTheme();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      {/* Public Navigation Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--bg-topbar)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)", padding: "1rem 3rem",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 38, height: 38, borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(124,58,237,0.4)"
          }}>
            <Zap size={22} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>
            AI Brand Growth Engine
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <a href="#features" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>Features</a>
          <a href="#showcase" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>Showcase</a>
          <a href="#pricing" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>Pricing</a>
          <a href="#faq" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>FAQ</a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={toggle} className="btn-ghost" style={{ padding: "0.5rem 0.875rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Globe size={15} /> {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <Link href="/overview" className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.375rem", textDecoration: "none", fontSize: "0.85rem" }}>
            <LogIn size={15} /> Log In
          </Link>
          <Link href="/overview" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", padding: "0.6rem 1.25rem", fontSize: "0.875rem", fontWeight: 600 }}>
            Launch Dashboard OS <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: "5rem 2rem 4rem", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          padding: "0.4rem 1.25rem", borderRadius: "99px",
          background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)",
          color: "#7c3aed", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem"
        }}>
          <Sparkles size={15} /> The Next-Gen Digital Marketing Operating System
        </div>

        <h1 style={{
          fontFamily: "var(--font-space)", fontSize: "3.75rem", fontWeight: 800,
          lineHeight: 1.15, letterSpacing: "-0.02em", color: "var(--text-primary)",
          maxWidth: "920px", margin: "0 auto 1.5rem"
        }}>
          Scale Your Brand with <span className="gradient-text">Autonomous AI Precision</span>
        </h1>

        <p style={{
          fontSize: "1.2rem", color: "var(--text-secondary)", maxWidth: "750px",
          margin: "0 auto 2.5rem", lineHeight: 1.6
        }}>
          An end-to-end digital marketing OS that extracts your Brand DNA, analyzes competitors, detects market trends, crafts content, publishes multi-channel, and continuously optimizes ROI.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "4rem" }}>
          <Link href="/overview" className="btn-primary" style={{ padding: "0.875rem 2.25rem", fontSize: "1.05rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            Launch Dashboard OS <ArrowRight size={18} />
          </Link>
          <a href="#showcase" className="btn-ghost" style={{ padding: "0.875rem 2.25rem", fontSize: "1.05rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <Play size={16} fill="currentColor" /> View Feature Showcase
          </a>
        </div>

        {/* Floating Dashboard Preview Image */}
        <div style={{
          position: "relative", borderRadius: "1.25rem", overflow: "hidden",
          border: "1px solid var(--border)", boxShadow: "0 25px 70px rgba(124,58,237,0.18)",
          background: "var(--bg-solid)"
        }}>
          <Image
            src="/images/landing_hero.png"
            alt="AI Brand Growth OS Floating Dashboard Preview"
            width={1200}
            height={675}
            style={{ width: "100%", height: "auto", display: "block" }}
            priority
          />
        </div>
      </section>

      {/* Visual Product & Asset Showcase */}
      <section id="showcase" style={{ padding: "5rem 2rem", background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ color: "#7c3aed", marginBottom: "0.5rem" }}>Rich Visual Assets</div>
            <h2 style={{ fontFamily: "var(--font-space)", fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
              High-Fidelity AI Brand & Creative Assets
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginTop: "0.5rem" }}>
              See how the engine generates ready-to-publish social assets, packaging mockups, and campaign visuals.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div className="card" style={{ padding: "1.75rem" }}>
              <div style={{ borderRadius: "0.75rem", overflow: "hidden", marginBottom: "1.25rem", border: "1px solid var(--border)" }}>
                <Image src="/images/product_package.png" alt="NovaBrew Packaging Asset" width={600} height={600} style={{ width: "100%", height: "360px", objectFit: "cover" }} />
              </div>
              <span className="badge badge-active" style={{ marginBottom: "0.5rem" }}>Brand Intelligence Asset</span>
              <h3 style={{ fontFamily: "var(--font-space)", fontSize: "1.375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                NovaBrew Single-Origin Packaging Mockup
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginTop: "0.25rem" }}>
                AI-generated product packaging aligned with NovaBrew’s matte-black and holographic brand guidelines.
              </p>
            </div>

            <div className="card" style={{ padding: "1.75rem" }}>
              <div style={{ borderRadius: "0.75rem", overflow: "hidden", marginBottom: "1.25rem", border: "1px solid var(--border)" }}>
                <Image src="/images/cold_brew.png" alt="Cold Brew Campaign Creative" width={600} height={600} style={{ width: "100%", height: "360px", objectFit: "cover" }} />
              </div>
              <span className="badge badge-approved" style={{ marginBottom: "0.5rem" }}>Content Engine Creative</span>
              <h3 style={{ fontFamily: "var(--font-space)", fontSize: "1.375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Instagram Reel Creative Preview — Artisanal Cold Brew
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginTop: "0.25rem" }}>
                Generated creative asset for the "Summer Cold Brew Revolution" campaign, achieving 96% Originality score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Engines Grid */}
      <section id="features" style={{ padding: "5.5rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="section-label" style={{ color: "#7c3aed", marginBottom: "0.5rem" }}>Complete Architecture</div>
          <h2 style={{ fontFamily: "var(--font-space)", fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
            10 Dedicated Marketing Engines
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginTop: "0.5rem" }}>
            A unified suite replacing 7+ disconnected marketing tools into one seamless workflow.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
          {engines.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card glass-hover" style={{ padding: "1.75rem", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "14px", background: `${color}15`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Icon size={24} color={color} />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-space)", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.375rem" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: "5rem 2rem", background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <div className="section-label" style={{ color: "#7c3aed", marginBottom: "0.5rem" }}>Simple Pricing</div>
          <h2 style={{ fontFamily: "var(--font-space)", fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "3.5rem" }}>
            Built for Ambitious Digital Brands
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Starter Plan */}
            <div className="card" style={{ padding: "2.25rem", textAlign: "left" }}>
              <div className="section-label" style={{ marginBottom: "0.5rem" }}>Starter Engine</div>
              <div style={{ fontFamily: "var(--font-space)", fontSize: "2.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
                $99<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/mo</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: "0.5rem 0 1.5rem" }}>
                Ideal for boutique brands and early-stage founders.
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.875rem", padding: 0, margin: "0 0 2rem", listStyle: "none" }}>
                {["1 Brand DNA Profile", "Content & Strategy Engines", "Social Publishing Integration", "Basic SEO & Keyword Tracking", "Community Support"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.9rem", color: "var(--text-soft)" }}>
                    <Check size={18} color="#10b981" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="btn-ghost" style={{ width: "100%", justifyContent: "center", display: "flex", textDecoration: "none", padding: "0.75rem" }}>
                Get Started
              </Link>
            </div>

            {/* Growth OS Plan */}
            <div className="card" style={{ padding: "2.25rem", textAlign: "left", border: "2px solid #7c3aed", background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(37,99,235,0.04))" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="section-label" style={{ color: "#7c3aed" }}>Growth OS (Recommended)</div>
                <span className="badge badge-active">Most Popular</span>
              </div>
              <div style={{ fontFamily: "var(--font-space)", fontSize: "2.75rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.5rem" }}>
                $299<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/mo</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: "0.5rem 0 1.5rem" }}>
                For scaling brands and digital marketing agencies.
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.875rem", padding: 0, margin: "0 0 2rem", listStyle: "none" }}>
                {["5 Brand DNA Profiles", "All 10 Marketing Engines Included", "Unlimited AI Content Generation", "Competitor Intelligence Radar", "AI Marketing Copilot Assistant", "Priority 24/7 Support"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.9rem", color: "var(--text-soft)" }}>
                    <Check size={18} color="#7c3aed" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "flex", textDecoration: "none", padding: "0.75rem" }}>
                Launch Growth OS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: "5rem 2rem", maxWidth: "840px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-space)", fontSize: "2.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {faqs.map((faq, index) => (
            <div key={index} className="card" style={{ cursor: "pointer", padding: "1.5rem" }} onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{faq.q}</h3>
                <ChevronDown size={20} color="var(--text-muted)" style={{ transform: activeFaq === index ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </div>
              {activeFaq === index && (
                <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.925rem", lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "3.5rem 2rem 2.5rem", background: "var(--bg-topbar)", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "1.125rem", color: "var(--text-primary)" }}>
            AI Brand Growth Engine
          </span>
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: "0 0 1.75rem" }}>
          Next-Generation Autonomous Marketing OS for Brands & Digital Agencies.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
          <Link href="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>Dashboard</Link>
          <Link href="/brand" style={{ color: "inherit", textDecoration: "none" }}>Brand DNA</Link>
          <Link href="/content" style={{ color: "inherit", textDecoration: "none" }}>Content Studio</Link>
          <Link href="/analytics" style={{ color: "inherit", textDecoration: "none" }}>Analytics</Link>
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          © 2026 AI Brand Growth Engine. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
