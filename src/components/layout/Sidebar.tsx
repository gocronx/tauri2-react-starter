import React from "react";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Database, Settings, Sparkles, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavTab } from "@/types";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { t } = useTranslation();

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      id: "records",
      label: t("nav.records"),
      icon: Database,
    },
    {
      id: "settings",
      label: t("nav.settings"),
      icon: Settings,
    },
  ];

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border/50 bg-card/40 backdrop-blur select-none">
      {/* Brand logo & name */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border/40 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
          <Layers className="h-4 w-4" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate font-bold text-sm tracking-tight text-foreground">
            Tauri 2 Starter
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Sparkles className="h-2.5 w-2.5 text-primary" /> React + Rust + SQLite
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 p-3">
        {/* Quick Search / Command Palette trigger */}
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", {
              key: "k",
              metaKey: true,
              bubbles: true,
            });
            document.dispatchEvent(event);
          }}
          className="mb-2 flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
        >
          <span className="flex items-center gap-1.5">
            <span>搜索与指令...</span>
          </span>
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground active:scale-[0.98]",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground",
                )}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="border-t border-border/40 p-3">
        <div className="rounded-lg bg-muted/40 p-2.5 text-center text-xs text-muted-foreground">
          <p className="font-medium text-foreground/80">Tauri v2.0 Enterprise</p>
          <p className="text-[11px] opacity-70">Ready for Production</p>
        </div>
      </div>
    </aside>
  );
}
