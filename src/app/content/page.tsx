"use client";

import Image from "next/image";
import { approvalQueue } from "@/lib/mock-data";
import { 
  Sparkles, Zap, Upload, RefreshCw, CheckCircle, X, Edit2, Copy, FileText, Video, 
  Image as ImageIcon, Hash, Layers, Cpu, ArrowRight, BarChart3, Download, Eye, 
  Sliders, Maximize2, Share2, Check, Clock, ShieldCheck, Play, Sparkle, Target
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

const contentTypes = [
  { id: "AI-Native", label: "AI-Native Studio", icon: Zap, desc: "Prompt-to-visual & copy generation" },
  { id: "Workflow", label: "Workflow Architecture", icon: Layers, desc: "End-to-end engine pipeline demo" },
  { id: "Source-Based", label: "Source Knowledge Base", icon: Upload, desc: "Generate from PDF, Blog, or Video" },
  { id: "Campaign-Package", label: "Multi-Channel Campaign Package", icon: Sparkles, desc: "1 Prompt → 4 Platform Assets" }
];

const visualStyles = [
  { id: "photorealistic", label: "Photorealistic Studio", desc: "8K dramatic lighting, shallow depth of field" },
  { id: "dark_minimal", label: "Dark Minimalist Luxury", desc: "Matte textures, amber glow, sleek composition" },
  { id: "infographic", label: "Infographic & Data Deck", desc: "Neon charts, dark mode UI overlay, crisp vector text" },
  { id: "cinematic_editorial", label: "Cinematic Editorial", desc: "Vogue style color grade, warm natural light" },
];

const aiGeneratedImages = [
  {
    id: "img1",
    src: "/images/ai_roasting_masterclass.png",
    title: "Precision Roasting Masterclass",
    type: "Photorealistic Studio",
    platform: "Instagram Reel",
    prompt: "Cinematic close-up photograph of specialty coffee beans roasting in a high-tech modern roaster, golden ambient light, dramatic smoke, luxury dark aesthetic, 8k resolution, rich texture",
    aspectRatio: "1:1 / 9:16",
    model: "FLUX.1-Pro",
    score: 98,
    category: "Reels"
  },
  {
    id: "img2",
    src: "/images/ai_cold_brew_lifestyle.png",
    title: "Nitro Cold Brew Infusion",
    type: "Dark Minimalist Luxury",
    platform: "Instagram / TikTok",
    prompt: "Artisanal nitro cold brew coffee served in a sleek crystal tumbler with crystal clear ice cubes, amber liquid drops, condensation on glass, dark stone tabletop backdrop, professional studio lighting",
    aspectRatio: "1:1 Square",
    model: "FLUX.1-Pro",
    score: 96,
    category: "Product"
  },
  {
    id: "img3",
    src: "/images/ai_carousel_infographic.png",
    title: "Elevation vs Flavor Chart",
    type: "Infographic & Data Deck",
    platform: "LinkedIn Carousel",
    prompt: "Sleek dark mode social media carousel graphic layout displaying coffee elevation chart with glowing purple and cyan data points, clean typography, futuristic UI card style",
    aspectRatio: "4:5 Carousel",
    model: "Midjourney v6.1",
    score: 94,
    category: "Infographics"
  },
  {
    id: "img4",
    src: "/images/ai_packaging_showcase.png",
    title: "Single-Origin Bag Unboxing",
    type: "Cinematic Editorial",
    platform: "X / Web Banner",
    prompt: "Luxury matte black specialty coffee bean pouch with gold minimalist typography standing on dark polished wooden counter with fresh coffee cherries, dramatic studio illumination",
    aspectRatio: "16:9 Landscape",
    model: "FLUX.1-Pro",
    score: 99,
    category: "Product"
  },
  {
    id: "img5",
    src: "/images/cold_brew.png",
    title: "High-Altitude Dry Air Ripening",
    type: "Photorealistic Studio",
    platform: "Instagram Post",
    prompt: "Fresh roasted Ethiopian coffee beans with subtle steam, rustic wooden scoop, natural window sunlight, warm earthy tones, macro details",
    aspectRatio: "1:1 Square",
    model: "FLUX.1-Pro",
    score: 95,
    category: "Product"
  },
  {
    id: "img6",
    src: "/images/product_package.png",
    title: "NovaBrew Signature Packaging",
    type: "Dark Minimalist Luxury",
    platform: "E-Commerce / Ads",
    prompt: "Minimalist eco-friendly coffee packaging box on textured dark slate with metallic purple foil accent lines, sleek modern design system",
    aspectRatio: "1:1 Square",
    model: "Midjourney v6.1",
    score: 97,
    category: "Product"
  }
];

const presets = [
  {
    id: "p1",
    title: "Elevation Science & Flavor Profile",
    platform: "Instagram",
    pillar: "Education",
    image: "/images/ai_roasting_masterclass.png",
    topic: "Explain why altitude (2,000m+) creates distinct blueberry and jasmine notes in Ethiopian coffee beans.",
    generatedCopy: `✨ The science behind your perfect cup starts 2,000m above sea level.\n\nOur Ethiopian Yirgacheffe beans spend 9 months ripening in high-altitude dry air — and that elevation is exactly why your morning cup carries those distinct blueberry and jasmine notes.\n\nNo additives. No shortcuts. Just elevation, patience, and precision roasting.\n\n🌿 Single-origin. Ethically sourced. Roasted fresh.\n\n→ Explore the origin at novabrew.com #SpecialtyCoffee #CoffeeScience #NovaBrew`,
    style: "Photorealistic Studio",
    scores: { brandFit: 98, seo: 92, virality: "9.6/10", compliance: "100%", factCheck: "Verified" }
  },
  {
    id: "p2",
    title: "Nitro Cold Brew Masterclass",
    platform: "YouTube",
    pillar: "Product",
    image: "/images/ai_cold_brew_lifestyle.png",
    topic: "5-Minute zero-bitterness cold brew concentrate recipe using 1:8 brew ratio.",
    generatedCopy: `[REEL SCRIPT — 45 Seconds]\n\n🎙️ HOOK (0-3s): "You've been cold brewing wrong this whole time. Here's why your brew tastes muddy."\n\n🎥 VISUAL (3-12s): Macro shot of nitro cold brew pouring over crystal ice in slow motion.\n\n💡 VALUE (12-35s): "The secret isn't brewing for 24 hours — it's blooming coarse Yirgacheffe grounds with hot water for 30s before chilling for 12 hours."\n\n🚀 CTA (35-45s): "Tap the link in bio to get our Cold Brew Concentrate Starter Pack."`,
    style: "Dark Minimalist Luxury",
    scores: { brandFit: 96, seo: 89, virality: "9.8/10", compliance: "98%", factCheck: "Verified" }
  },
  {
    id: "p3",
    title: "Elevation vs. Flavor Data Deck",
    platform: "LinkedIn",
    pillar: "Sustainability",
    image: "/images/ai_carousel_infographic.png",
    topic: "Breakdown of elevation vs flavor complexity trade margins in direct-trade coffee farming.",
    generatedCopy: `Specialty coffee commands a premium for one main reason: altitude accountability.\n\nEvery bag of NovaBrew Yirgacheffe represents:\n• A named family farm in Gedeo Zone, Ethiopia (2,100m)\n• 3rd-generation high-altitude farming expertise\n• Direct trade pricing paid at 2.8× the commodity rate\n\nThe real question isn't "why does specialty coffee cost $28?"\n\nIt's "why does commodity coffee cost so little?"\n\n#SpecialtyCoffee #DirectTrade #Sustainability #NovaBrew`,
    style: "Infographic & Data Deck",
    scores: { brandFit: 99, seo: 95, virality: "9.1/10", compliance: "100%", factCheck: "Verified" }
  },
  {
    id: "p4",
    title: "Limited Edition Single-Origin Drop",
    platform: "X",
    pillar: "Culture",
    image: "/images/ai_packaging_showcase.png",
    topic: "Thread introducing our new matte gold single-origin batch drop.",
    generatedCopy: `Thread: Why we capped this Ethiopian Yirgacheffe batch at 500 bags 🧵\n\n1/ At 2,100 meters altitude, harvesting is 100% hand-picked. Only 300kg of ripe cherries meet our density test each harvest week.\n\n2/ We roast in small 12kg batches to preserve delicate floral volatile compounds.\n\n3/ Bag #001 through #500 drop live today at 10 AM EST.\n\n4/ Direct link: novabrew.com/drops`,
    style: "Cinematic Editorial",
    scores: { brandFit: 97, seo: 90, virality: "9.3/10", compliance: "100%", factCheck: "Verified" }
  }
];

const workflowSteps = [
  {
    step: "01",
    title: "Strategic Ingestion",
    subtitle: "Brand DNA & Audience Rules",
    icon: Target,
    color: "#7c3aed",
    desc: "Ingests brand positioning, prohibited terms, tone guidelines, competitor gap opportunities, and live trending topics.",
    details: {
      inputData: "Brand DNA v2.4 + Real-time Gap Database",
      metricsEvaluated: ["Tone Compliance", "USP Alignment", "Target Demographic Persona"],
      engineLatency: "120 ms",
      activeGuardrails: "No aggressive sales pitches, verified altitude claims only"
    }
  },
  {
    step: "02",
    title: "Dual LLM Synthesis",
    subtitle: "GPT-4o + Claude 3.5 Sonnet",
    icon: Cpu,
    color: "#2563eb",
    desc: "Simultaneously generates channel-optimized copy, hashtag matrices, hook variations, and precise visual generation prompts.",
    details: {
      modelsUsed: "Claude 3.5 Sonnet (Copy) & GPT-4o (Visual Prompt Engine)",
      promptStrategy: "Few-shot Brand Voice In-Context Prompting",
      engineLatency: "840 ms",
      outputFormats: "Caption, Thread, Video Script, Carousel Slide Deck"
    }
  },
  {
    step: "03",
    title: "AI Visual Engine",
    subtitle: "FLUX.1-Pro & Midjourney v6.1",
    icon: ImageIcon,
    color: "#10b981",
    desc: "Renders 8K photorealistic visual assets, custom product staging mockups, and dark-mode data infographics automatically matched to the copy.",
    details: {
      renderingEngine: "FLUX.1-Pro API + Custom LoRA Brand Style Embeddings",
      resolution: "2048 x 2048 / 9:16 Vertical Video Frame",
      engineLatency: "1,250 ms",
      visualOutputs: ["Photorealistic Photography", "Vector Infographic", "Product Staging"]
    }
  },
  {
    step: "04",
    title: "Multi-Metric Audit",
    subtitle: "Brand Fit & SEO Validator",
    icon: ShieldCheck,
    color: "#f59e0b",
    desc: "Automated quality control engine scores Brand Voice Fit, Virality Index, Fact-Check confidence, and SEO Keyword optimization.",
    details: {
      scoringModules: ["Brand Fit Radar", "Virality Prediction (0-10)", "Fact-Check Module"],
      thresholdPass: "Minimum 90% Brand Fit required for auto-queue",
      engineLatency: "190 ms",
      status: "Passed 5/5 Quality Checks"
    }
  },
  {
    step: "05",
    title: "Multi-Platform Push",
    subtitle: "Automated Scheduling Queue",
    icon: ArrowRight,
    color: "#ec4899",
    desc: "Formats assets into native platform specs and queues them into optimal engagement publishing windows.",
    details: {
      destinationChannels: ["Instagram", "LinkedIn", "X (Twitter)", "YouTube Shorts", "TikTok"],
      publishingMode: "Direct API Integration / Approval Queue",
      engineLatency: "95 ms",
      optimalTimeSlot: "Tomorrow, 9:15 AM EST (Peak Engagement)"
    }
  }
];

export default function ContentPage() {
  const [activeType, setActiveType] = useState("AI-Native");
  const [platform, setPlatform]     = useState("Instagram");
  const [pillar, setPillar]         = useState("Education");
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [selectedImage, setSelectedImage] = useState("/images/ai_roasting_masterclass.png");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated]   = useState(true);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(0);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<typeof aiGeneratedImages[0] | null>(null);
  const [copied, setCopied] = useState(false);

  const [activePreset, setActivePreset] = useState(presets[0]);

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setActivePreset(preset);
    setPlatform(preset.platform);
    setPillar(preset.pillar);
    setSelectedImage(preset.image);
    setCustomPrompt(preset.topic);
    setGenerated(true);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { 
      setGenerating(false); 
      setGenerated(true); 
    }, 1800);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredGallery = selectedGalleryCategory === "All" 
    ? aiGeneratedImages 
    : aiGeneratedImages.filter(img => img.category === selectedGalleryCategory);

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        
        {/* TOP HERO HEADER */}
        <div className="card" style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.08) 50%, rgba(16,185,129,0.06) 100%)",
          border: "1px solid rgba(124,58,237,0.25)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.25rem", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className="badge badge-active" style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem" }}>
                  <Sparkles size={13} /> AI Content & Visual Engine 2.0
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} /> Avg Render Time: 1.8s
                </span>
              </div>
              <h1 style={{ fontFamily: "var(--font-space)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)", margin: 0 }}>
                Multimodal Content Studio & Visual Generator
              </h1>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.375rem", maxWidth: "780px" }}>
                Generate brand-aligned copywriting, 8K hyperrealistic AI visuals, carousel graphic decks, and video scripts from a single prompt or strategic content gap.
              </p>
            </div>

            {/* QUICK BENCHMARK STATS */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ padding: "0.625rem 0.875rem", background: "var(--surface-2)", borderRadius: "0.625rem", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 600 }}>Visual Engine</div>
                <div style={{ fontFamily: "var(--font-space)", fontSize: "0.95rem", fontWeight: 700, color: "#7c3aed" }}>FLUX.1 + MJ v6</div>
              </div>
              <div style={{ padding: "0.625rem 0.875rem", background: "var(--surface-2)", borderRadius: "0.625rem", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 600 }}>Brand DNA Fit</div>
                <div style={{ fontFamily: "var(--font-space)", fontSize: "0.95rem", fontWeight: 700, color: "#10b981" }}>98.4% Match</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN NAVIGATION TABS */}
        <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: 4 }}>
          {contentTypes.map(t => {
            const Icon = t.icon;
            const isSelected = activeType === t.id;
            return (
              <button key={t.id} onClick={() => setActiveType(t.id)}
                className={isSelected ? "btn-primary" : "btn-ghost"}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem", 
                  fontSize: "0.8125rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "0.625rem",
                  border: isSelected ? "none" : "1px solid var(--border)",
                  background: isSelected ? undefined : "var(--surface-2)",
                  whiteSpace: "nowrap"
                }}>
                <Icon size={15} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600 }}>{t.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* TAB 1: WORKFLOW ARCHITECTURE VISUALIZER (Demonstrates content engine flow for clients) */}
        {activeType === "Workflow" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeInUp 0.3s ease both" }}>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <div className="section-label" style={{ marginBottom: 4 }}>Client Pitch Interactive Workflow Demo</div>
                  <h2 style={{ fontFamily: "var(--font-space)", fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                    How the AI Content & Visual Engine Operates
                  </h2>
                </div>
                <span className="badge badge-active" style={{ fontSize: "0.75rem" }}>
                  ⚡ Live Autonomous Pipeline
                </span>
              </div>

              {/* STEPPER BAR */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {workflowSteps.map((ws, idx) => {
                  const Icon = ws.icon;
                  const isActive = activeWorkflowStep === idx;
                  return (
                    <div 
                      key={ws.step}
                      onClick={() => setActiveWorkflowStep(idx)}
                      style={{
                        padding: "0.875rem",
                        borderRadius: "0.75rem",
                        border: `1.5px solid ${isActive ? ws.color : "var(--border)"}`,
                        background: isActive ? `${ws.color}15` : "var(--surface-2)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: ws.color, fontFamily: "var(--font-space)" }}>
                          STAGE {ws.step}
                        </span>
                        <div style={{ 
                          width: 26, height: 26, borderRadius: "50%", 
                          background: isActive ? ws.color : "var(--surface-3)", 
                          display: "flex", alignItems: "center", justifyContent: "center" 
                        }}>
                          <Icon size={14} color={isActive ? "white" : "var(--text-muted)"} />
                        </div>
                      </div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                        {ws.title}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ws.subtitle}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STEP DETAIL EXPANDED PANEL */}
              {(() => {
                const current = workflowSteps[activeWorkflowStep];
                const Icon = current.icon;
                return (
                  <div style={{
                    padding: "1.25rem",
                    borderRadius: "0.875rem",
                    background: "var(--surface-2)",
                    border: `1px solid ${current.color}40`,
                    display: "grid",
                    gridTemplateColumns: "1.1fr 0.9fr",
                    gap: "1.5rem"
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "0.625rem", background: current.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={18} color="white" />
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                            Stage {current.step}: {current.title}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: current.color, fontWeight: 600 }}>{current.subtitle}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
                        {current.desc}
                      </p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div style={{ padding: "0.625rem", background: "var(--bg-solid)", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Input Source</div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{current.details.inputData || current.details.modelsUsed || current.details.renderingEngine}</div>
                        </div>
                        <div style={{ padding: "0.625rem", background: "var(--bg-solid)", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Stage Latency</div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", marginTop: 2 }}>{current.details.engineLatency}</div>
                        </div>
                      </div>
                    </div>

                    {/* LIVE PIPELINE SAMPLE PAYLOAD DEMO */}
                    <div style={{ background: "var(--bg-solid)", borderRadius: "0.75rem", padding: "1rem", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.625rem" }}>
                        <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-muted)" }}>
                          RAW PIPELINE EXECUTION JSON
                        </span>
                        <span className="badge badge-active" style={{ fontSize: "0.65rem" }}>200 OK</span>
                      </div>
                      <pre style={{
                        fontSize: "0.725rem",
                        fontFamily: "monospace",
                        color: "var(--text-soft)",
                        background: "var(--surface-2)",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        maxHeight: "180px",
                        overflowY: "auto"
                      }}>
{JSON.stringify({
  stage_id: `STAGE_${current.step}`,
  stage_name: current.title,
  brand_id: "novabrew_official",
  brand_voice: ["Authentic", "Innovative", "Sustainable"],
  target_platforms: ["Instagram", "LinkedIn", "X", "YouTube"],
  active_models: {
    copywriter: "Claude-3.5-Sonnet",
    visuals: "FLUX.1-Pro",
    guardrails: "Llama-Guard-3"
  },
  status: "Completed",
  latency_ms: current.details.engineLatency
}, null, 2)}
                      </pre>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* FLOW DIAGRAM PREVIEW */}
            <div className="card">
              <div className="section-label" style={{ marginBottom: 8 }}>Visual Engine Architecture Diagram</div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.5rem",
                background: "var(--surface-2)",
                borderRadius: "0.875rem",
                border: "1px solid var(--border)",
                gap: "0.5rem",
                overflowX: "auto"
              }}>
                <div style={{ textAlign: "center", minWidth: 120 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(124,58,237,0.15)", border: "1px solid #7c3aed", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
                    <Target size={20} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>Brand Prompt</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Pillars & Gap Topic</div>
                </div>

                <ArrowRight size={18} color="var(--text-muted)" />

                <div style={{ textAlign: "center", minWidth: 140 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(37,99,235,0.15)", border: "1px solid #2563eb", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
                    <Cpu size={20} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>Dual LLM Synthesizer</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Voice & Image Prompt</div>
                </div>

                <ArrowRight size={18} color="var(--text-muted)" />

                <div style={{ textAlign: "center", minWidth: 140 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "1px solid #10b981", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
                    <ImageIcon size={20} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>8K Visual Generator</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>FLUX.1 Image Render</div>
                </div>

                <ArrowRight size={18} color="var(--text-muted)" />

                <div style={{ textAlign: "center", minWidth: 140 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(245,158,11,0.15)", border: "1px solid #f59e0b", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
                    <BarChart3 size={20} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>Quality & SEO Scoring</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Brand Fit (98%)</div>
                </div>

                <ArrowRight size={18} color="var(--text-muted)" />

                <div style={{ textAlign: "center", minWidth: 120 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(236,72,153,0.15)", border: "1px solid #ec4899", color: "#ec4899", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
                    <Share2 size={20} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>Multi-Platform</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Instant Push</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 & DEFAULT: AI-NATIVE STUDIO GENERATOR */}
        {(activeType === "AI-Native" || activeType === "Source-Based") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* ONE-CLICK CLIENT DEMO PRESETS */}
            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={14} color="#7c3aed" />
                  <span style={{ fontFamily: "var(--font-space)", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    One-Click Client Demo Presets
                  </span>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Click to instantly load pre-generated AI visual & copy packages</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.625rem" }}>
                {presets.map(p => {
                  const isActive = activePreset.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p)}
                      style={{
                        padding: "0.625rem 0.75rem",
                        borderRadius: "0.625rem",
                        border: `1px solid ${isActive ? "#7c3aed" : "var(--border)"}`,
                        background: isActive ? "rgba(124,58,237,0.12)" : "var(--surface-2)",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span className="badge badge-active" style={{ fontSize: "0.6rem", padding: "0.15rem 0.4rem" }}>{p.platform}</span>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#10b981" }}>{p.scores.brandFit}% Fit</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              
              {/* GENERATOR INPUT FORM */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="card">
                  <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{activeType === "Source-Based" ? "Source-Based AI Generator" : "AI Visual & Copy Studio"}</span>
                    <span style={{ fontSize: "0.7rem", color: "#7c3aed", fontWeight: 600 }}>FLUX.1 + GPT-4o</span>
                  </div>

                  {activeType === "Source-Based" && (
                    <div style={{ marginBottom: "1rem", padding: "1.25rem", border: "2px dashed rgba(124,58,237,0.3)", borderRadius: "0.875rem", textAlign: "center", background: "rgba(124,58,237,0.04)" }}>
                      <Upload size={24} color="#7c3aed" style={{ margin: "0 auto 0.375rem" }} />
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>Drop Source Knowledge Asset</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Upload PDF report, raw interview MP3, blog link, or product spec sheet</div>
                    </div>
                  )}

                  {/* PLATFORM SELECTOR */}
                  <div style={{ marginBottom: "0.875rem" }}>
                    <div className="section-label" style={{ marginBottom: 6 }}>Target Channel Platform</div>
                    <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                      {["Instagram","LinkedIn","X","YouTube","TikTok"].map(p => (
                        <button key={p} onClick={() => { setPlatform(p); }} style={{
                          padding: "0.35rem 0.75rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                          border: `1px solid ${platform===p?"#7c3aed":"var(--border)"}`,
                          background: platform===p ? "rgba(124,58,237,0.15)" : "var(--surface-2)",
                          color: platform===p ? "#7c3aed" : "var(--text-secondary)",
                          fontFamily: "var(--font-sans)",
                        }}>{p}</button>
                      ))}
                    </div>
                  </div>

                  {/* PILLAR SELECTOR */}
                  <div style={{ marginBottom: "0.875rem" }}>
                    <div className="section-label" style={{ marginBottom: 6 }}>Content Strategy Pillar</div>
                    <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                      {["Education","Product","Sustainability","Culture","Community"].map(p => (
                        <button key={p} onClick={() => setPillar(p)} style={{
                          padding: "0.35rem 0.75rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer",
                          border: `1px solid ${pillar===p?"#10b981":"var(--border)"}`,
                          background: pillar===p ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                          color: pillar===p ? "#10b981" : "var(--text-secondary)",
                          fontFamily: "var(--font-sans)",
                        }}>{p}</button>
                      ))}
                    </div>
                  </div>

                  {/* AI VISUAL STYLE SELECTOR */}
                  <div style={{ marginBottom: "0.875rem" }}>
                    <div className="section-label" style={{ marginBottom: 6 }}>AI Visual Aesthetic Style</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem" }}>
                      {visualStyles.map(vs => (
                        <button key={vs.id} onClick={() => setSelectedStyle(vs.id)} style={{
                          padding: "0.5rem 0.625rem", borderRadius: "0.5rem", textAlign: "left", cursor: "pointer",
                          border: `1px solid ${selectedStyle===vs.id?"#7c3aed":"var(--border)"}`,
                          background: selectedStyle===vs.id ? "rgba(124,58,237,0.1)" : "var(--surface)",
                        }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: selectedStyle===vs.id ? "#7c3aed" : "var(--text-primary)" }}>{vs.label}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vs.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TOPIC / PROMPT INPUT */}
                  <div style={{ marginBottom: "0.875rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div className="section-label">Topic / Content Prompt</div>
                      <button className="btn-ghost" style={{ fontSize: "0.6875rem", padding: "0.2rem 0.5rem", color: "#7c3aed" }} onClick={() => setCustomPrompt("Explain why altitude affects coffee bean flavor and roast density.")}>
                        <Sparkles size={11} /> Auto-Enhance Prompt
                      </button>
                    </div>
                    <textarea 
                      className="input" 
                      rows={3} 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="E.g. Explain why high altitude ripening creates blueberry flavor notes in single origin Ethiopia..." 
                      style={{ resize: "none", fontSize: "0.8125rem" }} 
                    />
                  </div>

                  <button className="btn-primary" style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", padding: "0.75rem" }} onClick={handleGenerate} disabled={generating}>
                    {generating ? (
                      <><RefreshCw size={15} className="animate-spin-slow" /> Rendering Copy & 8K Visual Asset…</>
                    ) : (
                      <><Sparkles size={15} /> Generate Content & Visuals</>
                    )}
                  </button>
                </div>
              </div>

              {/* LIVE GENERATED PREVIEW & VISUAL DISPLAY */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {generating && (
                  <div className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
                    <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem", animation:"pulse-glow 2s ease-in-out infinite" }}>
                      <Zap size={24} color="white" />
                    </div>
                    <div style={{ fontFamily:"var(--font-space)", fontWeight:700, color:"var(--text-primary)", fontSize: "1.1rem", marginBottom:"0.5rem" }}>
                      Rendering High-Res Visual & Copywriting…
                    </div>
                    <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", maxWidth: 360, margin: "0 auto 1.5rem" }}>
                      Executing FLUX.1 image diffusion algorithm and running Brand DNA tone compliance checks for {platform}.
                    </p>
                    <div className="skeleton" style={{ height:14, width:"85%", margin:"0 auto 0.625rem" }} />
                    <div className="skeleton" style={{ height:14, width:"65%", margin:"0 auto 0.625rem" }} />
                    <div className="skeleton" style={{ height:14, width:"45%", margin:"0 auto" }} />
                  </div>
                )}

                {generated && !generating && (
                  <div className="card" style={{ animation: "fadeInUp 0.4s ease both" }}>
                    
                    {/* PREVIEW TOP BAR */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.875rem" }}>
                      <div style={{ display:"flex", gap:"0.375rem", alignItems: "center" }}>
                        <span className="badge badge-active" style={{ background: "rgba(124,58,237,0.15)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.3)" }}>
                          {platform}
                        </span>
                        <span className="badge badge-approved" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                          {activePreset.scores.brandFit}% Brand Fit
                        </span>
                      </div>
                      <div style={{ display:"flex", gap:"0.375rem" }}>
                        <button onClick={handleGenerate} className="btn-ghost" style={{ padding:"0.35rem 0.625rem", display:"flex", alignItems:"center", gap:4, fontSize:"0.75rem" }}>
                          <RefreshCw size={12}/> Regen
                        </button>
                        <button onClick={() => handleCopyText(activePreset.generatedCopy)} className="btn-ghost" style={{ padding:"0.35rem 0.625rem", display:"flex", alignItems:"center", gap:4, fontSize:"0.75rem" }}>
                          {copied ? <Check size={12} color="#10b981" /> : <Copy size={12}/>} {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* GENERATED HIGH-RES AI VISUAL IMAGE PREVIEW */}
                    <div style={{ 
                      borderRadius: "0.75rem", 
                      overflow: "hidden", 
                      marginBottom: "0.875rem", 
                      border: "1px solid var(--border)",
                      position: "relative",
                      background: "#000"
                    }}>
                      <Image 
                        src={selectedImage} 
                        alt="AI Generated Social Media Creative" 
                        width={600} 
                        height={340} 
                        style={{ width: "100%", height: "240px", objectFit: "cover" }} 
                      />
                      
                      {/* OVERLAY BADGES ON IMAGE */}
                      <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", gap: "0.5rem" }}>
                        <span style={{ padding: "0.25rem 0.625rem", borderRadius: "99px", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", color: "white", fontSize: "0.65rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          <Sparkles size={11} color="#7c3aed" /> Generated via FLUX.1 8K
                        </span>
                        <span style={{ padding: "0.25rem 0.625rem", borderRadius: "99px", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", color: "white", fontSize: "0.65rem", fontWeight: 600 }}>
                          Aspect Ratio: 1:1
                        </span>
                      </div>

                      <button 
                        onClick={() => {
                          const matched = aiGeneratedImages.find(img => img.src === selectedImage);
                          if (matched) setLightboxImage(matched);
                        }}
                        style={{
                          position: "absolute", top: 10, right: 10,
                          padding: "0.35rem 0.625rem", borderRadius: "0.5rem",
                          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
                          color: "white", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem"
                        }}
                      >
                        <Maximize2 size={12} /> View HD
                      </button>
                    </div>

                    {/* INTERACTIVE IMAGE SWITCHER GALLERY */}
                    <div style={{ marginBottom: "0.875rem" }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 4, fontWeight: 600 }}>
                        SELECT ALTERNATIVE AI GENERATED VISUAL VARIANT:
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.375rem" }}>
                        {aiGeneratedImages.slice(0, 4).map(img => (
                          <div 
                            key={img.id}
                            onClick={() => setSelectedImage(img.src)}
                            style={{
                              height: 52,
                              borderRadius: "0.5rem",
                              overflow: "hidden",
                              border: `2px solid ${selectedImage === img.src ? "#7c3aed" : "transparent"}`,
                              cursor: "pointer",
                              position: "relative"
                            }}
                          >
                            <Image src={img.src} alt={img.title} width={100} height={52} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GENERATED COPYWRITING PREVIEW */}
                    <pre style={{ 
                      fontSize:"0.8125rem", 
                      color:"var(--text-soft)", 
                      lineHeight:1.7, 
                      whiteSpace:"pre-wrap", 
                      fontFamily:"var(--font-sans)", 
                      background:"var(--surface-2)", 
                      padding:"1rem", 
                      borderRadius:"0.625rem", 
                      borderLeft:"3px solid #7c3aed", 
                      margin:0 
                    }}>
                      {activePreset.generatedCopy}
                    </pre>

                    {/* MULTI-METRIC SCORES */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"0.375rem", marginTop:"0.875rem" }}>
                      {[
                        ["Brand Fit", activePreset.scores.brandFit, "#7c3aed"],
                        ["SEO Score", activePreset.scores.seo, "#2563eb"],
                        ["Virality", activePreset.scores.virality, "#10b981"],
                        ["Compliance", activePreset.scores.compliance, "#f59e0b"],
                        ["Fact Check", activePreset.scores.factCheck, "#ec4899"]
                      ].map(([k,v,c]) => (
                        <div key={String(k)} style={{ textAlign:"center", padding:"0.5rem 0.25rem", background:"var(--surface-2)", borderRadius:"0.5rem", border: "1px solid var(--border)" }}>
                          <div style={{ fontFamily:"var(--font-space)", fontSize:"0.9rem", fontWeight:700, color:String(c) }}>{v}</div>
                          <div style={{ fontSize:"0.6rem", color:"var(--text-muted)", marginTop: 2 }}>{k}</div>
                        </div>
                      ))}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display:"flex", gap:"0.5rem", marginTop:"0.875rem" }}>
                      <button className="btn-primary" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:"0.8125rem" }}>
                        <CheckCircle size={14}/> Send to Approval Queue
                      </button>
                      <button className="btn-ghost" style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.8125rem" }}>
                        <Share2 size={13}/> Schedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MULTI-CHANNEL CAMPAIGN PACKAGE BUILDER */}
        {activeType === "Campaign-Package" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", animation: "fadeInUp 0.3s ease both" }}>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <div className="section-label">Multi-Channel Asset Package Generator</div>
                  <h2 style={{ fontFamily: "var(--font-space)", fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                    1 Seed Prompt → 4 Native Platform Outputs
                  </h2>
                </div>
                <span className="badge badge-active">Instant Omni-Channel Creation</span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                Demonstrate to clients how a single campaign theme automatically branches into an Instagram Reel, a LinkedIn Thought Leadership Article, an X (Twitter) Thread, and a YouTube Short video storyboard.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                {presets.map((p, idx) => (
                  <div key={p.id} className="card" style={{ background: "var(--surface-2)", padding: "0.875rem", border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span className="badge badge-active" style={{ fontSize: "0.65rem" }}>{p.platform}</span>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#10b981" }}>{p.scores.brandFit}% Fit</span>
                    </div>

                    <div style={{ borderRadius: "0.5rem", overflow: "hidden", height: 110, marginBottom: "0.75rem", position: "relative" }}>
                      <Image src={p.image} alt={p.title} width={300} height={110} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>

                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                      {p.title}
                    </div>

                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "0.75rem" }}>
                      {p.generatedCopy}
                    </p>

                    <button 
                      onClick={() => handleApplyPreset(p)}
                      className="btn-ghost" 
                      style={{ width: "100%", fontSize: "0.75rem", padding: "0.4rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                    >
                      <Eye size={12} /> Inspect Package
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: AI GENERATED VISUAL ASSET SHOWCASE GALLERY (Rich Image Showcase requested by user) */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div>
              <div className="section-label" style={{ marginBottom: 2 }}>Client Pitch Visual Showcase</div>
              <h2 style={{ fontFamily: "var(--font-space)", fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                AI-Generated Media Library ({aiGeneratedImages.length} Visual Assets)
              </h2>
            </div>

            {/* CATEGORY FILTER BUTTONS */}
            <div style={{ display: "flex", gap: "0.375rem" }}>
              {["All", "Reels", "Infographics", "Product"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedGalleryCategory(cat)}
                  className={selectedGalleryCategory === cat ? "btn-primary" : "btn-ghost"}
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem", borderRadius: "99px" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* GALLERY GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
            {filteredGallery.map(img => (
              <div 
                key={img.id} 
                className="glass-hover"
                style={{ 
                  borderRadius: "0.875rem", 
                  overflow: "hidden", 
                  border: "1px solid var(--border)", 
                  background: "var(--surface-2)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* IMAGE CONTAINER WITH HOVER METADATA */}
                <div style={{ position: "relative", height: 180, width: "100%", background: "#000" }}>
                  <Image src={img.src} alt={img.title} width={400} height={180} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  
                  <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: "0.375rem" }}>
                    <span className="badge badge-active" style={{ fontSize: "0.6rem", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", border: "none", color: "white" }}>
                      {img.platform}
                    </span>
                  </div>

                  <div style={{ position: "absolute", top: 10, right: 10 }}>
                    <span className="badge" style={{ fontSize: "0.65rem", background: "rgba(16,185,129,0.85)", color: "white", border: "none" }}>
                      {img.score}% Match
                    </span>
                  </div>

                  <button 
                    onClick={() => setLightboxImage(img)}
                    style={{
                      position: "absolute", bottom: 10, right: 10,
                      width: 32, height: 32, borderRadius: "50%",
                      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
                      color: "white", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>

                {/* CARD CONTENT */}
                <div style={{ padding: "0.875rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    {img.title}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.625rem", display: "flex", gap: "0.5rem" }}>
                    <span>Model: {img.model}</span>
                    <span>•</span>
                    <span>Style: {img.type}</span>
                  </div>

                  <div style={{
                    fontSize: "0.725rem",
                    color: "var(--text-secondary)",
                    background: "var(--surface)",
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    marginBottom: "0.75rem"
                  }}>
                    Prompt: "{img.prompt}"
                  </div>

                  <div style={{ display: "flex", gap: "0.375rem", marginTop: "auto" }}>
                    <button 
                      onClick={() => { setSelectedImage(img.src); setActiveType("AI-Native"); }}
                      className="btn-primary" 
                      style={{ flex: 1, fontSize: "0.725rem", padding: "0.4rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                    >
                      <Sparkles size={11} /> Load in Studio
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: APPROVAL QUEUE INTEGRATION */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
            <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
              Pending Approval Pipeline Queue ({approvalQueue.length} Items)
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Auto-Sync Enabled</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
            {approvalQueue.map(item => (
              <div key={item.id} style={{ padding: "0.75rem", background: "var(--surface-2)", borderRadius: "0.625rem", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: "0.5rem", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText size={18} color="white" />
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {item.platform} · {item.type}
                  </div>
                </div>
                <span className="badge badge-review" style={{ fontSize: "0.65rem" }}>Review</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* HIGH-RES LIGHTBOX MODAL */}
      {lightboxImage && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem"
        }} onClick={() => setLightboxImage(null)}>
          <div style={{
            background: "var(--bg-solid)",
            borderRadius: "1rem",
            maxWidth: "800px",
            width: "100%",
            overflow: "hidden",
            border: "1px solid var(--border)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                  {lightboxImage.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 600 }}>{lightboxImage.model} • {lightboxImage.platform}</div>
              </div>
              <button onClick={() => setLightboxImage(null)} className="btn-ghost" style={{ padding: "0.5rem" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ position: "relative", width: "100%", height: "420px", background: "#000" }}>
              <Image src={lightboxImage.src} alt={lightboxImage.title} fill style={{ objectFit: "contain" }} />
            </div>

            <div style={{ padding: "1.25rem" }}>
              <div className="section-label" style={{ marginBottom: 4 }}>FLUX.1 Generation Prompt</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", background: "var(--surface-2)", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1rem", lineHeight: 1.5 }}>
                "{lightboxImage.prompt}"
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block" }}>Brand Fit</span>
                    <span style={{ fontWeight: 700, color: "#10b981" }}>{lightboxImage.score}%</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block" }}>Aspect Ratio</span>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{lightboxImage.aspectRatio}</span>
                  </div>
                </div>

                <button onClick={() => { setSelectedImage(lightboxImage.src); setLightboxImage(null); setActiveType("AI-Native"); }} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={14} /> Edit in AI Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

