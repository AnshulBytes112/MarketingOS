"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Brain, Users, TrendingUp, Lightbulb,
  Sparkles, Megaphone, Send, BarChart3, Search, MessageSquare,
  Settings, Zap, ChevronRight, LogOut
} from "lucide-react";

const nav = [
  { label: "Dashboard",          href: "/overview",   icon: LayoutDashboard },
  { label: "Brand Intelligence",  href: "/brand",      icon: Brain },
  { label: "Competitor Intel",    href: "/competitors",icon: Users },
  { label: "Market Intelligence", href: "/market",     icon: TrendingUp },
  { label: "Strategy Engine",     href: "/strategy",   icon: Lightbulb },
  { label: "Content Engine",      href: "/content",    icon: Sparkles },
  { label: "Campaign Engine",     href: "/campaigns",  icon: Megaphone },
  { label: "Publishing",          href: "/publishing", icon: Send },
  { label: "Analytics",           href: "/analytics",  icon: BarChart3 },
  { label: "SEO Engine",          href: "/seo",        icon: Search },
  { label: "AI Copilot",          href: "/copilot",    icon: MessageSquare },
  { label: "Settings",            href: "/settings",   icon: Settings },
];

export function Sidebar({ 
  user,
  organization
}: {
  user?: { name: string; role: string };
  organization?: { id: string; name: string };
}) {
  const pathname = usePathname();
  const router = useRouter();

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
    <aside style={{
      width: "220px",
      minWidth: "220px",
      background: "var(--bg-sidebar)",
      borderRight: "1px solid var(--sidebar-border)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      transition: "background 0.25s, border-color 0.25s",
    }}>
      {/* Logo */}
      <div style={{ padding: "1.25rem 1rem 1rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "8px",
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(124,58,237,0.35)",
          }}>
            <Zap size={16} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.2 }}>AI Brand</div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 500 }}>Growth Engine</div>
          </div>
        </div>

        {/* Org badge */}
        <div style={{
          marginTop: "0.75rem",
          background: "rgba(124,58,237,0.08)",
          border: "1px solid rgba(124,58,237,0.18)",
          borderRadius: "0.5rem",
          padding: "0.375rem 0.625rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <div style={{
              width: 20, height: 20, borderRadius: "4px",
              background: "linear-gradient(135deg,#7c3aed,#2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.5rem", fontWeight: 700, color: "white",
            }}>{organization?.name?.substring(0, 2).toUpperCase() || 'OG'}</div>
            <span style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 500 }}>{organization?.name || 'Organization'}</span>
          </div>
          <ChevronRight size={12} color="#7c3aed" />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.75rem 0.625rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
        <div className="section-label" style={{ padding: "0.25rem 0.75rem 0.5rem" }}>Engines</div>

        {nav.slice(0, 11).map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`sidebar-item ${active ? "active" : ""}`}>
              <Icon size={15} className="sidebar-icon" style={{ flexShrink: 0 }} />
              <span>{label}</span>
              {active && (
                <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#7c3aed" }} />
              )}
            </Link>
          );
        })}

        <div style={{ flex: 1 }} />
        <div className="section-label" style={{ padding: "0.75rem 0.75rem 0.5rem" }}>System</div>

        {nav.slice(11).map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`sidebar-item ${active ? "active" : ""}`}>
              <Icon size={15} className="sidebar-icon" style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile & Log Out */}
      <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div className="glass-hover" style={{
          padding: "0.625rem 0.75rem", borderRadius: "0.625rem",
          display: "flex", alignItems: "center", gap: "0.5rem",
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg,#7c3aed,#2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 700, color: "white", flexShrink: 0,
          }}>{user?.name?.substring(0, 2).toUpperCase() || 'US'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{user?.role || 'Role'}</div>
          </div>
          <button onClick={handleLogout} title="Log Out" style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", display: "flex" }}>
            <LogOut size={14} color="#ef4444" />
          </button>
        </div>
      </div>
    </aside>
  );
}
