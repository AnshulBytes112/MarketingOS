"use client";

import { Bell, Search, Zap, RefreshCw, Sun, Moon, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/overview":    { title: "Dashboard Overview",    subtitle: "Executive overview of your brand performance" },
  "/brand":       { title: "Brand Intelligence",    subtitle: "Brand DNA profile and asset management" },
  "/competitors": { title: "Competitor Intelligence", subtitle: "Competitive landscape monitoring and gap analysis" },
  "/market":      { title: "Market Intelligence",   subtitle: "Social listening and trend detection" },
  "/strategy":    { title: "Strategy Engine",       subtitle: "Monthly strategy, content pillars, and funnel mapping" },
  "/content":     { title: "Content Engine",        subtitle: "AI content generation and creative studio" },
  "/campaigns":   { title: "Campaign Engine",       subtitle: "Campaign management and goal tracking" },
  "/publishing":  { title: "Publishing Engine",     subtitle: "Platform connections, scheduling, and publishing" },
  "/analytics":   { title: "Analytics Engine",      subtitle: "Post-level and campaign-level performance data" },
  "/seo":         { title: "SEO Engine",            subtitle: "Keyword research and content gap analysis" },
  "/copilot":     { title: "AI Marketing Copilot",  subtitle: "Natural language queries over your brand data" },
  "/settings":    { title: "Settings",              subtitle: "Organization, users, roles, and integrations" },
};

export function Topbar({
  user,
  organization
}: {
  user?: { name: string; role: string };
  organization?: { id: string; name: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { title, subtitle } = titles[pathname] ?? { title: "AI Brand Growth Engine", subtitle: "" };
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <header style={{
      height: "60px",
      background: "var(--bg-topbar)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.875rem",
      flexShrink: 0,
      transition: "background 0.25s, border-color 0.25s",
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 1 }}>{subtitle}</div>
      </div>

      {/* Org/Brand Switcher Placeholder */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        padding: "0.4rem 0.75rem", background: "var(--surface-2)",
        border: "1px solid var(--border)", borderRadius: "0.5rem",
        fontSize: "0.8rem", fontWeight: 500, color: "var(--text-primary)"
      }}>
        {organization?.name || "Organization"}
      </div>

      {/* AI status pill */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.375rem",
        background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: "99px", padding: "0.25rem 0.625rem",
        fontSize: "0.7rem", fontWeight: 600, color: "#7c3aed",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", boxShadow: "0 0 8px #7c3aed" }} />
        <Zap size={10} />
        AI Active
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        background: "var(--surface-2)", border: "1px solid var(--border)",
        borderRadius: "0.5rem", padding: "0.4rem 0.75rem",
        width: 200, transition: "all 0.2s",
      }}>
        <Search size={13} color="var(--text-muted)" />
        <input
          placeholder="Search…"
          style={{
            background: "none", border: "none", outline: "none",
            fontSize: "0.8rem", color: "var(--text-primary)", width: "100%",
            fontFamily: "var(--font-sans)",
          }}
        />
      </div>

      {/* Refresh */}
      <button className="btn-ghost" style={{ padding: "0.4rem", display: "flex", lineHeight: 0 }}>
        <RefreshCw size={14} />
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 36, borderRadius: "0.5rem", cursor: "pointer",
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: `1px solid var(--border)`,
          transition: "all 0.25s",
          position: "relative", overflow: "hidden",
        }}
      >
        <span style={{
          position: "absolute", transition: "transform 0.35s, opacity 0.35s",
          transform: isDark ? "rotate(-90deg) scale(0)" : "rotate(0deg) scale(1)",
          opacity: isDark ? 0 : 1,
        }}>
          <Sun size={15} color="#d97706" />
        </span>
        <span style={{
          position: "absolute", transition: "transform 0.35s, opacity 0.35s",
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0)",
          opacity: isDark ? 1 : 0,
        }}>
          <Moon size={15} color="#a78bfa" />
        </span>
      </button>

      {/* Notifications */}
      <button style={{
        position: "relative",
        background: "var(--surface-2)", border: "1px solid var(--border)",
        borderRadius: "0.5rem", padding: "0.4rem",
        cursor: "pointer", display: "flex", alignItems: "center",
        lineHeight: 0, transition: "all 0.2s",
      }}>
        <Bell size={14} color="var(--text-secondary)" />
        <span style={{
          position: "absolute", top: "5px", right: "5px",
          width: 6, height: 6, background: "#7c3aed", borderRadius: "50%",
          boxShadow: "0 0 6px #7c3aed",
        }} />
      </button>

      {/* Log Out button */}
      <button
        onClick={handleLogout}
        className="btn-ghost"
        style={{
          display: "flex", alignItems: "center", gap: "0.375rem",
          padding: "0.4rem 0.75rem", fontSize: "0.75rem", color: "#ef4444",
          borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
        }}
      >
        <LogOut size={13} color="#ef4444" />
        Log Out {user ? `(${user.name.split(' ')[0]})` : ''}
      </button>
    </header>
  );
}
