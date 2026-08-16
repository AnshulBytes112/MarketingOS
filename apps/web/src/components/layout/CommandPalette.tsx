'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  LayoutDashboard, Brain, Users, TrendingUp, Lightbulb,
  Sparkles, Megaphone, Send, BarChart3, Search, MessageSquare,
  Settings
} from 'lucide-react';
import './command-palette.css'; // Minimal CSS for cmdk

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="cmdk-overlay z-50">
      <Command.Dialog open={open} onOpenChange={setOpen} label="Global Command Menu" className="cmdk-dialog">
        <Command.Input placeholder="Type a command or search..." className="cmdk-input" />
        <Command.List className="cmdk-list">
          <Command.Empty className="cmdk-empty">No results found.</Command.Empty>
          
          <Command.Group heading="Engines" className="cmdk-group">
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/overview'))}>
              <LayoutDashboard size={16} className="mr-2" /> Overview
            </Command.Item>
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/brand'))}>
              <Brain size={16} className="mr-2" /> Brand Intelligence
            </Command.Item>
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/competitors'))}>
              <Users size={16} className="mr-2" /> Competitor Intelligence
            </Command.Item>
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/market'))}>
              <TrendingUp size={16} className="mr-2" /> Market Intelligence
            </Command.Item>
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/strategy'))}>
              <Lightbulb size={16} className="mr-2" /> Strategy Engine
            </Command.Item>
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/content'))}>
              <Sparkles size={16} className="mr-2" /> Content Engine
            </Command.Item>
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/campaigns'))}>
              <Megaphone size={16} className="mr-2" /> Campaign Engine
            </Command.Item>
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/seo'))}>
              <Search size={16} className="mr-2" /> SEO Engine
            </Command.Item>
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/analytics'))}>
              <BarChart3 size={16} className="mr-2" /> Analytics Engine
            </Command.Item>
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/copilot'))}>
              <MessageSquare size={16} className="mr-2" /> AI Copilot
            </Command.Item>
          </Command.Group>
          <Command.Group heading="System" className="cmdk-group">
            <Command.Item className="cmdk-item" onSelect={() => runCommand(() => router.push('/settings'))}>
              <Settings size={16} className="mr-2" /> Settings
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </div>
  );
}
