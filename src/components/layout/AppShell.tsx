"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto" style={{ padding: "1.5rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
