"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/layout/CommandPalette";

export function AppShell({ 
  children, 
  user,
  organization
}: { 
  children: React.ReactNode;
  user: { name: string; role: string };
  organization: { id: string; name: string };
}) {
  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar user={user} organization={organization} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar user={user} organization={organization} />
        <main className="flex-1 overflow-y-auto" style={{ padding: "1.5rem" }}>
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
